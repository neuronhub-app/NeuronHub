from django.contrib import admin

from neuronhub.apps.highlighter.models import PostHighlight


@admin.register(PostHighlight)
class PostHighlightAdmin(admin.ModelAdmin):
    list_display = [
        "post_title",
        "user",
        "text",
        "text_postfix",
        "created_at",
    ]
    list_filter = [
        "post",
        "user",
        "created_at",
    ]
    list_select_related = ["post", "user"]
    search_fields = [
        "text",
        "text_prefix",
        "text_postfix",
    ]
    autocomplete_fields = [
        "post",
        "user",
    ]

    @admin.display(description="title")
    def post_title(self, obj: PostHighlight):
        if obj.post:
            return obj.post.title or obj.post.content_polite[:50]
        return obj
