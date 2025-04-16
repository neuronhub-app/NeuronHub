from django.contrib import admin

from neuronhub.apps.tools.models import Company
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolAlternative
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolStatsGithub
from neuronhub.apps.tools.models import ToolTag


class ToolAlternativeInline(admin.TabularInline):
    model = ToolAlternative
    fk_name = "tool"
    extra = 0
    autocomplete_fields = ["tool_alternative", "author"]
    fields = [
        "tool_alternative",
        "is_vote_positive",
        "author",
    ]


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
    autocomplete_fields = [
        "tags",
        "alternatives",
    ]
    inlines = [
        ToolAlternativeInline,
    ]


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "description",
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
        "author",
        "created_at",
    ]
    list_filter = [
        "is_vote_positive",
        "author",
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
    autocomplete_fields = [
        "tag_parent",
        "author",
    ]

    def get_search_results(self, request, queryset, search_term):
        queryset, may_have_duplicates = super().get_search_results(
            request, queryset, search_term
        )
        # filter out parent tags, which just look like noise duplicates
        return queryset.filter(tag_parent__isnull=False), may_have_duplicates


@admin.register(ToolReview)
class ToolReviewAdmin(admin.ModelAdmin):
    list_display = [
        "tool",
        "author",
        "rating",
        "is_private",
        "reviewed_at",
        "created_at",
    ]
    list_filter = [
        "tool",
        "author",
        "reviewed_at",
    ]

    autocomplete_fields = [
        "tool",
        "orgs",
        "author",
        "visible_to_users",
        "visible_to_groups",
        "recommended_to_users",
        "recommended_to_groups",
        "tool_tags",
    ]
