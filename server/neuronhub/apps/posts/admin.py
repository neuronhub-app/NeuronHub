from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Post
from .models import PostTagVote
from .models import PostVote


class PostTagInline(admin.TabularInline):
    model = Post.tags.through
    extra = 0
    verbose_name = "Tag"

    # weird django thing - it creates a fake `tooltag` field M2M through
    autocomplete_fields = ["tooltag"]


@admin.register(Post)
class PostAdmin(SimpleHistoryAdmin):
    inlines = [PostTagInline]

    list_display = (
        "title",
        "author",
        "tool",
        "visibility",
        "created_at",
        "updated_at",
    )
    list_filter = [
        "visibility",
        "created_at",
        "updated_at",
        "author",
        "tool",
    ]
    search_fields = [
        "title",
        "content",
        "author__username",
        "tool__name",
    ]
    autocomplete_fields = ["tool", "author", "visible_to_users", "visible_to_groups", "tags"]
    readonly_fields = ["created_at", "updated_at", "slug"]
    fieldsets = (
        (
            None,
            {
                "fields": [
                    "title",
                    "slug",
                    "author",
                    "tool",
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
    readonly_fields = ["created_at", "updated_at"]
