from django.contrib import admin

from axonhub.apps.tools.models import Tool
from axonhub.apps.tools.models import ToolAlternative
from axonhub.apps.tools.models import ToolReview
from axonhub.apps.tools.models import ToolStatsGithub
from axonhub.apps.tools.models import ToolTag


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "slug",
        "created_at",
    ]
    search_fields = [
        "name",
    ]


@admin.register(ToolAlternative)
class ToolAlternativeAdmin(admin.ModelAdmin):
    list_display = [
        "tool",
        "tool_alternative",
        "is_vote_positive",
        "user",
        "created_at",
    ]
    list_filter = [
        "is_vote_positive",
        "user",
        "created_at",
    ]


@admin.register(ToolStatsGithub)
class ToolStatsGithubAdmin(admin.ModelAdmin):
    autocomplete_fields = [
        "tool",
    ]
    list_display = [
        "tool",
        "stars",
        "kloc",
        "forks",
        "watchers",
        "issues",
        "pull_requests",
    ]


@admin.register(ToolTag)
class ToolTagAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "tag_parent",
        "author",
        "created_at",
    ]
    search_fields = [
        "name",
    ]
    filter_horizontal = [
        "tools",
    ]
    autocomplete_fields = [
        "tools",
        "tag_parent",
        "author",
    ]


@admin.register(ToolReview)
class ToolReviewAdmin(admin.ModelAdmin):
    list_display = [
        "tool",
        "user",
        "rating",
        "is_published",
        "reviewed_at",
        "created_at",
    ]
    list_filter = [
        "tool",
        "user",
        "reviewed_at",
    ]

    autocomplete_fields = [
        "tool",
        "orgs",
        "user",
    ]
