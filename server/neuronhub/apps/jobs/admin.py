from zoneinfo import ZoneInfo

from dalf.admin import DALFModelAdmin
from dalf.admin import DALFRelatedFieldAjaxMulti
from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.db.models import QuerySet
from django.http import HttpRequest
from django.http import HttpResponseForbidden
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.safestring import mark_safe
from django_object_actions import DjangoObjectActions
from django_object_actions import action
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.models import JobsLandingPage
from neuronhub.apps.jobs.tasks import airtable_sync_task
from neuronhub.apps.jobs.tasks import send_job_alert_emails_by_ids_task
from neuronhub.apps.sites.services.send_email import send_mail_sync
from neuronhub.apps.users.models import User


@admin.register(Job)
class JobAdmin(DjangoObjectActions, SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "title",
        "org",
        "is_published",
        "salary_min",
        "created_at_in_airtable",
        "closes_at",
    ]

    autocomplete_fields = [
        "author",
        "org",
        "versions",
        "locations",
        "tags_education",
        "tags_area",
        "tags_skill",
        "tags_workload",
        "tags_experience",
        "bookmarked_by_users",
        "visible_to_users",
        "visible_to_groups",
    ]

    list_filter = [
        ("author", DALFRelatedFieldAjaxMulti),
        ("locations", DALFRelatedFieldAjaxMulti),
        ("tags_skill", DALFRelatedFieldAjaxMulti),
        ("tags_area", DALFRelatedFieldAjaxMulti),
        ("tags_workload", DALFRelatedFieldAjaxMulti),
        ("tags_experience", DALFRelatedFieldAjaxMulti),
        ("bookmarked_by_users", DALFRelatedFieldAjaxMulti),
        ("org", DALFRelatedFieldAjaxMulti),
        "is_published",
        "created_at",
        "updated_at",
        "created_at_in_airtable",
        "published_at",
        "closes_at",
    ]

    search_fields = [
        "title",
        "org__name",
        "slug",
        "description",
    ]

    fieldsets = [
        (
            "",
            {
                "fields": [
                    "title",
                    "slug",
                    "org",
                    "description",
                    "salary_min",
                    "salary_text",
                    "url_external",
                    "url_external_with_utm",
                    "is_published",
                    "versions",
                    "bookmarked_by_users",
                ]
            },
        ),
        (
            "Tags",
            {
                "fields": [
                    "locations",
                    "tags_skill",
                    "tags_area",
                    "tags_education",
                    "tags_experience",
                    "tags_workload",
                ]
            },
        ),
        (
            "Visibility",
            {
                "fields": [
                    "visibility",
                    "visible_to_users",
                    "visible_to_groups",
                ]
            },
        ),
        (
            "Timestamps",
            {
                "fields": [
                    "published_at",
                    "created_at_in_airtable",
                    "closes_at",
                    "created_at",
                    "updated_at",
                ],
            },
        ),
    ]

    readonly_fields = ["slug", "created_at", "updated_at"]

    changelist_actions = ["airtable_sync"]

    @action(label="Sync Airtable", description="Enqueue Airtable Orgs+Jobs sync task")
    def airtable_sync(self, request: HttpRequest, queryset: QuerySet):
        if not request.user.is_superuser:
            self.message_user(request, "Must be a superuser.", level=messages.ERROR)
            return

        airtable_sync_task.enqueue(email_to_notify=request.user.email)
        self.message_user(
            request,
            f"Enqueued Airtable sync task. On completion you'll receive an email at {request.user.email}.",
        )


@admin.register(JobAlert)
class JobAlertAdmin(SimpleHistoryAdmin, DjangoObjectActions, DALFModelAdmin):
    list_display = [
        "email",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "is_subscribe_to_newsletter",
        "is_active",
        "is_invalid_location",
        "salary_min",
        "sent_count",
        "jobs_notified_count",
        "created_at",
        "tz",
    ]
    autocomplete_fields = [
        "tags",
        "locations",
    ]
    search_fields = [
        "email",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
    ]
    list_filter = [
        "utm_source",
        "utm_campaign",
        "utm_content",
        "utm_medium",
        ("tags", DALFRelatedFieldAjaxMulti),
        ("locations", DALFRelatedFieldAjaxMulti),
        "is_subscribe_to_newsletter",
        "is_orgs_highlighted",
        "is_active",
        "is_invalid_location",
        "is_exclude_no_salary",
        "is_exclude_career_capital",
        "is_exclude_profit_for_good",
        "salary_min",
        "is_remote",
        "created_at",
        "updated_at",
    ]
    actions = [
        "trigger_send_job_alerts",
    ]
    change_actions = [
        "set_tz_to_none",
        "set_tz_to_pt",
    ]

    @admin.action(
        description="Send emails for Alerts (won't duplicate; if Alert has TZ - will work only at 8:00-8:59am)"
    )
    def trigger_send_job_alerts(self, request: HttpRequest, queryset: QuerySet):
        if not request.user.is_staff:
            return HttpResponseForbidden()

        alert_ids = list(queryset.values_list("id", flat=True))
        send_job_alert_emails_by_ids_task.enqueue(alert_ids)
        self.message_user(
            request,
            mark_safe(f"""
                Enqueued job alerts task for {len(alert_ids)} alert(s).
                <a href="https://docs.neuronhub.app/usage/reference/job-alert-emails">Docs</a>
            """),
        )

    @action(label="Empty TimeZone")
    def set_tz_to_none(self, request: HttpRequest, obj: JobAlert):
        obj.tz = ""  # type: ignore[assignment] #bad-infer TimeZoneField accepts ""
        obj.save()
        messages.success(request, "TZ removed")

    @action(label="Set TimeZone to PT")
    def set_tz_to_pt(self, request: HttpRequest, obj: JobAlert):
        obj.tz = ZoneInfo("America/Los_Angeles")
        obj.save()
        messages.success(request, "TZ removed")


@admin.register(JobAlertLog)
class JobAlertLogAdmin(SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "job_alert__email",
        "sent_at",
        "job_slug_and_date_ids",
    ]
    autocomplete_fields = ["jobs", "job_alert"]
    list_filter = [
        ("jobs", DALFRelatedFieldAjaxMulti),
        ("job_alert", DALFRelatedFieldAjaxMulti),
        "sent_at",
        "created_at",
        "updated_at",
    ]


@admin.register(JobsLandingPage)
class JobsLandingPageAdmin(DjangoObjectActions, SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "slug",
        "title",
        "salary_min",
        "is_published",
        "updated_at",
        "created_at",
    ]
    autocomplete_fields = ["tags", "locations"]
    search_fields = ["slug", "title"]
    list_filter = [
        ("tags", DALFRelatedFieldAjaxMulti),
        ("locations", DALFRelatedFieldAjaxMulti),
        "is_orgs_highlighted",
        "source_ext",
        "is_published",
        "created_at",
        "updated_at",
    ]
    change_actions = ["preview", "request_to_publish"]

    @action(label="Preview Saved Page")
    def preview(self, request: HttpRequest, obj: JobsLandingPage):
        return HttpResponseRedirect(f"{settings.CLIENT_URL}/jobs/drafts/landing-pages/{obj.pk}")

    @action(label="Request to Publish", description="Email admin asking to deploy it in 4-16h.")
    def request_to_publish(self, request: HttpRequest, obj: JobsLandingPage):
        assert isinstance(request.user, User)
        admin_url = request.build_absolute_uri(
            reverse("admin:jobs_jobslandingpage_change", args=[obj.pk])
        )
        send_mail_sync(
            subject=f"Request to Publish JobsLandingPage: /{obj.slug}",
            message_html=(
                f"Requested by {request.user.email}.<br>"
                f'Admin: <a href="{admin_url}">{admin_url}</a>'
            ),
            email_to=settings.ADMIN_EMAIL,
        )
        messages.success(
            request,
            "Request sent. Will be deployed in 4-16h. You'll get an email once it's live.",
        )


@admin.register(JobLocation)
class JobLocationAdmin(DALFModelAdmin):
    list_display = [
        "name",
        "country",
        "city",
        "is_remote",
        "created_at",
    ]
    search_fields = [
        "name",
        "country",
        "city",
    ]
