from dalf.admin import DALFModelAdmin
from dalf.admin import DALFRelatedFieldAjaxMulti
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert


@admin.register(Job)
class JobAdmin(SimpleHistoryAdmin, DALFModelAdmin):
    list_display = [
        "title",
        "org",
        "country",
        "salary_min",
        "is_remote",
        "posted_at",
        "closes_at",
    ]

    autocomplete_fields = [
        "author",
        "org",
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
            "Profile",
            {
                "fields": [
                    "title",
                    "slug",
                    "org",
                    ("country", "city"),
                    "is_remote",
                    "is_remote_friendly",
                    "is_visa_sponsor",
                    ("salary_min", "salary_max"),
                    "url_external",
                    "tags_skill",
                    "tags_area",
                    "tags_education",
                    "tags_experience",
                    "tags_workload",
                    "bookmarked_by_users",
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
    list_filter = [
        ("tags", DALFRelatedFieldAjaxMulti),
        "is_orgs_highlighted",
        "is_active",
        "created_at",
        "updated_at",
    ]
