from zoneinfo import ZoneInfo

from dalf.admin import DALFModelAdmin
from dalf.admin import DALFRelatedFieldAjaxMulti
from django.contrib import admin
from django.contrib import messages
from django.db.models import QuerySet
from django.http import HttpRequest
from django.http import HttpResponseForbidden
from django.utils.safestring import mark_safe
from django_object_actions import DjangoObjectActions
from django_object_actions import action
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.tasks import send_job_alert_emails_by_ids_task


@admin.register(Job)
class JobAdmin(SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "title",
        "org",
        "is_published",
        "salary_min",
        "posted_at",
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
        "created_at",
        "posted_at",
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
                "fields": ["posted_at", "closes_at", "created_at", "updated_at"],
            },
        ),
    ]

    readonly_fields = ["slug", "created_at", "updated_at"]


@admin.register(JobAlert)
class JobAlertAdmin(SimpleHistoryAdmin, DjangoObjectActions, DALFModelAdmin):
    list_display = [
        "email",
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
        "jobs_clicked",
        "locations",
    ]
    search_fields = [
        "email",
    ]
    list_filter = [
        ("tags", DALFRelatedFieldAjaxMulti),
        ("locations", DALFRelatedFieldAjaxMulti),
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
        "email_hash",
        "sent_at",
    ]
    autocomplete_fields = ["jobs", "job_alert"]
    list_filter = [
        ("jobs", DALFRelatedFieldAjaxMulti),
        ("job_alert", DALFRelatedFieldAjaxMulti),
        "sent_at",
        "created_at",
        "updated_at",
    ]


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
