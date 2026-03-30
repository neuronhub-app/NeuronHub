from asgiref.sync import async_to_sync
from dalf.admin import DALFModelAdmin
from dalf.admin import DALFRelatedFieldAjaxMulti
from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest
from django.http import HttpResponseForbidden
from django.utils.safestring import mark_safe
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog
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
    ]

    fieldsets = [
        (
            "",
            {
                "fields": [
                    "title",
                    "slug",
                    "org",
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
class JobAlertAdmin(SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "email",
        "is_active",
        "sent_count",
        "created_at",
    ]
    autocomplete_fields = ["tags", "jobs_clicked"]
    search_fields = [
        "email",
    ]
    list_filter = [
        ("tags", DALFRelatedFieldAjaxMulti),
        "is_orgs_highlighted",
        "is_active",
        "created_at",
        "updated_at",
    ]
    actions = [
        "trigger_send_job_alerts",
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


@admin.register(JobAlertLog)
class JobAlertLogAdmin(SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "job_alert__email",
        "job",
        "email_hash",
        "sent_at",
    ]
    autocomplete_fields = ["job", "job_alert"]
    list_filter = [
        ("job", DALFRelatedFieldAjaxMulti),
        ("job_alert", DALFRelatedFieldAjaxMulti),
        "sent_at",
        "created_at",
        "updated_at",
    ]
