from django.contrib import admin
from django.contrib.admin.widgets import ForeignKeyRawIdWidget
from django.urls import NoReverseMatch
from django.urls import reverse
from simple_history.admin import SimpleHistoryAdmin

from neuronhub.apps.posts.models import Post, PostTypeEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagVote
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models import PostVote
from neuronhub.apps.posts.models.tools import ToolCompany


class OptimisedForeignKeyRawIdWidget(ForeignKeyRawIdWidget):
    """
    A fix for ForeignKeyRawIdWidget calling [[PostTag]].objects.get(id=id) for each admin.Inline,
    to render [[PostTag]]'s __str__ → HTTP TTL goes over 30s → killing /change/ page
    """

    def label_and_url_for_value(self, value):
        try:
            url = reverse(
                f"{self.admin_site.name}:{self.rel.model._meta.app_label}_{self.rel.model._meta.object_name.lower()}_change",
                args=[value],
            )
        except NoReverseMatch:
            url = ""
        return str(value), url


_meta_model = "posttag"


class PostTagInline(admin.TabularInline):
    """
    Weird Django: creates a meta-level `Post_tags` model (posttag [[_meta_model]])
    for M2M through admin.*Inlines pages.
    """

    model = Post.tags.through
    verbose_name = "Tag"
    autocomplete_fields = [_meta_model]

    fields = [
        _meta_model,
        "name",
        "is_vote_positive",
        "author",
        "is_important",
    ]
    raw_id_fields = [_meta_model]

    # all must be readonly except 1
    readonly_fields = fields[1:]  # type: ignore # everything but first input (field "id") for Tag selection

    ordering = [f"-{_meta_model}__is_important", f"-{_meta_model}__created_at"]

    extra = 0

    def name(self, obj):
        return str(obj.posttag.label)

    def is_important(self, obj):
        if obj.posttag.is_important:
            return "⭐"
        else:
            return ""

    @admin.display(description="vote")
    def is_vote_positive(self, obj):
        if vote := obj.posttag.votes.filter(author=obj.post.author).first():
            return vote.is_vote_positive
        else:
            return "-"

    def author(self, obj):
        return obj.posttag.author.username

    def description(self, obj):
        return obj.posttag.description

    def is_review_tag(self, obj):
        return obj.posttag.is_review_tag

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.form.base_fields[_meta_model].widget = OptimisedForeignKeyRawIdWidget(
            rel=self.model._meta.get_field(_meta_model).remote_field,
            admin_site=admin.site,
        )
        return formset

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # not tested, might be making perf worse
        return qs.select_related(
            f"{_meta_model}__author",  # for [[PostTagInline#author]]
            f"{_meta_model}__tag_parent",  # for [[PostTagInline#name]]
        ).prefetch_related(
            f"{_meta_model}__votes",  # for [[PostTagInline#is_vote_positive]]
        )


class PostReviewTagInline(PostTagInline):
    model = Post.review_tags.through  # type: ignore
    verbose_name = "Review Tag"


class PostVoteInline(admin.TabularInline):
    model = PostVote
    extra = 0
    verbose_name = "Votes"


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
    inlines = [
        PostTagInline,
        PostReviewTagInline,
        PostVoteInline,
    ]

    list_display = [
        "_get_title",
        "type",
        "_get_parent_title_short",
        "_get_parent_root_title_short",
        "author",
        "visibility",
        "created_at",
        "updated_at",
    ]
    list_select_related = ["parent", "parent_root"]
    list_filter = [
        "type",
        "visibility",
        "created_at",
        "updated_at",
        "author",
        "parent",
    ]
    search_fields = [
        "title",
        "content_polite",
        "content_direct",
        "content_rant",
        "author__username",
        "parent__title",
    ]
    autocomplete_fields = [
        "parent",
        "parent_root",
        "author",
        "visible_to_users",
        "visible_to_groups",
        "company",
        "recommended_to_users",
        "recommended_to_groups",
    ]
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
                    "parent_root",
                    "content_polite",
                    "content_direct",
                    "content_rant",
                    "image",
                    "created_at",
                    "updated_at",
                ]
            },
        ),
        (
            "Post Tool",
            {
                "fields": (
                    "company",
                    "tool_type",
                    "domain",
                    "url",
                    "crunchbase_url",
                    "github_url",
                )
            },
        ),
        (
            "Post Review",
            {
                "fields": (
                    "review_rating",
                    "review_experience_hours",
                    "review_importance",
                    "review_usage_status",
                    "reviewed_at",
                )
            },
        ),
        (
            "Recommended to users",
            {
                "fields": (
                    "recommended_to_users",
                    "recommended_to_groups",
                )
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
        (
            "Source",
            {
                "fields": (
                    "source",
                    "source_author",
                )
            },
        ),
    )

    @admin.display(description="title")
    def _get_title(self, obj: Post) -> str:
        return obj.title[:20] if obj.title else obj.content_polite[:20]

    @admin.display(description="parent")
    def _get_parent_title_short(self, obj: Post) -> str:
        if not obj.parent:
            return ""

        if obj.parent.type == PostTypeEnum.Comment:
            return obj.parent.content_polite[:20]
        else:
            return obj.parent.title[:20] if obj.parent.title else ""

    @admin.display(description="root")
    def _get_parent_root_title_short(self, obj: Post) -> str:
        return obj.parent_root.title[:20] if obj.parent_root else ""


@admin.register(PostTag)
class PostTagAdmin(admin.ModelAdmin):
    list_display = [
        "_get_name_full",
        "author",
        "created_at",
    ]
    list_select_related = ["tag_parent__tag_parent__tag_parent"]
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
