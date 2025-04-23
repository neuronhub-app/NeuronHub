from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagVote
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models import PostVote
from neuronhub.apps.posts.models.tools import ToolCompany


class PostTagInline(admin.TabularInline):
    model = Post.tags.through
    extra = 0
    verbose_name = "Tag"

    # weird django thing - it creates a fake `posttag` field M2M through
    autocomplete_fields = ["posttag"]


class ToolAlternativeInline(admin.TabularInline):
    model = PostRelated
    fk_name = "tool"
    extra = 0
    autocomplete_fields = ["tool_alternative", "author"]
    fields = [
        "tool_alternative",
        "is_vote_positive",
        "author",
    ]


@admin.register(ToolCompany)
class ToolCompanyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "description",
        "created_at",
    ]
    search_fields = [
        "name",
    ]


@admin.register(Post)
class PostAdmin(SimpleHistoryAdmin):
    inlines = [PostTagInline]

    list_display = (
        "title",
        "author",
        "parent",
        "visibility",
        "created_at",
        "updated_at",
    )
    list_filter = [
        "visibility",
        "created_at",
        "updated_at",
        "author",
        "parent",
    ]
    search_fields = [
        "title",
        "content",
        "author__username",
        "parent__title",
    ]
    autocomplete_fields = ["parent", "author", "visible_to_users", "visible_to_groups", "tags"]
    readonly_fields = ["created_at", "updated_at", "slug"]
    fieldsets = (
        (
            None,
            {
                "fields": [
                    "title",
                    "slug",
                    "author",
                    "parent",
                    "content",
                    "created_at",
                    "updated_at",
                ]
            },
        ),
        (
            "Visibility",
            {
                "fields": (
                    "visibility",
                    "visible_to_users",
                    "visible_to_groups",
                )
            },
        ),
    )


@admin.register(PostTag)
class PostTagAdmin(admin.ModelAdmin):
    list_display = [
        "_get_name_full",
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

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("tag_parent__tag_parent__tag_parent")

    def get_search_results(self, request, queryset, search_term):
        queryset, may_have_duplicates = super().get_search_results(
            request, queryset, search_term
        )
        # filter out parent tags, which just look like noise duplicates
        return queryset.filter(tag_parent__isnull=False), may_have_duplicates

    @admin.display(description="name")
    def _get_name_full(self, obj: PostTag):
        return str(obj)


@admin.register(PostVote)
class PostVoteAdmin(SimpleHistoryAdmin):
    list_display = [
        "post",
        "author",
        "is_vote_positive",
        "created_at",
    ]
    list_filter = [
        "is_vote_positive",
        "created_at",
        "author",
    ]
    search_fields = ["post__title"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(PostTagVote)
class PostTagVoteAdmin(SimpleHistoryAdmin):
    list_display = [
        "post",
        "tag",
        "author",
        "is_vote_positive",
        "created_at",
    ]
    list_filter = [
        "is_vote_positive",
        "created_at",
        "author",
        "tag",
    ]
    search_fields = [
        "post__title",
        "tag__name",
    ]
    readonly_fields = [
        "created_at",
        "updated_at",
    ]
