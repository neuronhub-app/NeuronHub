import textwrap
from typing import Any

from asgiref.sync import async_to_sync
from django.contrib.auth.models import AnonymousUser
from django.db import models
from django.db.models import CharField
from django.db.models import ManyToManyField
from django.test import RequestFactory
from django.utils import timezone
from django_choices_field import TextChoicesField
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords
from solo.models import SingletonModel
from strawberry_django.descriptors import model_cached_property
from strawberry_django.descriptors import model_property

from neuronhub.apps.admin.utils.convert_md_to_html_for_admin import convert_md_to_html_for_admin
from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.graphql.persisted_query_extension import _load_client_persisted_queries_json
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.types import PostTypeEnum
from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


class UsageStatus(models.TextChoices):
    USING = "using"
    USED = "used"
    WANT_TO_USE = "want_to_use", "Want to use"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested", "Not interested"


class PostManagerAbstract(models.Manager["Post"]):
    type = PostTypeEnum.Post

    def get_queryset(self) -> models.QuerySet[Post]:
        return super().get_queryset().filter(type=self.type)


class PostManager(PostManagerAbstract):
    type = PostTypeEnum.Post


class ToolManager(PostManagerAbstract):
    type = PostTypeEnum.Tool


class ReviewManager(PostManagerAbstract):
    type = PostTypeEnum.Review


class CommentManager(PostManagerAbstract):
    type = PostTypeEnum.Comment


class PostCategory(models.TextChoices):
    Knowledge = "knowledge"
    Opinion = "opinion"
    Question = "question"
    News = "news"


@anonymizer.register
class Post(AnonimazableTimeStampedModel):
    objects = models.Manager()
    posts = PostManager()
    tools = ToolManager()
    reviews = ReviewManager()
    comments = CommentManager()

    Type = PostTypeEnum
    type = TextChoicesField(Type, default=Type.Post)

    category = TextChoicesField(
        PostCategory,
        blank=True,
        null=True,
        default=None,
    )

    parent = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        help_text=(
            convert_md_to_html_for_admin(
                """
                Can link to possible Post.Type, depending on your current Type:
                - PostTool for Post|Review|Comment
                - PostReview for Post|Tool
                - PostComment for Post|Tool|Review|Comment
                """
            )
        ),
        related_name="children",
    )
    parent_root = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        help_text="eg Post<Comment> can have a .parent Post<Comment>, but .parent_root is always not a Comment",
        related_name="root_children",
    )

    alternatives = models.ManyToManyField(
        "self",
        through="posts.PostRelated",
        symmetrical=False,  # todo refac: clarify why
        related_name="alternatives_to",
    )

    tags = ManyToManyField("posts.PostTag", related_name="posts", blank=True)

    author = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)

    users_read_later = models.ManyToManyField(
        User, related_name=UserListName.read_later.value, blank=True
    )
    users_library = models.ManyToManyField(
        User, related_name=UserListName.library.value, blank=True
    )
    seen_by_users = models.ManyToManyField(
        User,
        related_name="posts_seen",
        blank=True,
        help_text="Marked 'seen' if present in browser's ViewBox for ~4 seconds",
    )
    collapsed_by_users = models.ManyToManyField(
        User,
        related_name="posts_collapsed",
        blank=True,
        help_text="Collapsed in the UI, eg CommentThread",
    )

    # Sharing fields
    # ----------------------------------------------------------------------

    recommended_to_users = anonymizable(  # type: ignore[var-annotated]
        models.ManyToManyField(User, related_name="posts_recommended", blank=True),
    )
    recommended_to_groups = anonymizable(  # type: ignore[var-annotated]
        models.ManyToManyField(
            UserConnectionGroup, related_name="posts_recommended", blank=True
        ),
    )
    visible_to_users = anonymizable(  # type: ignore[var-annotated]
        models.ManyToManyField(User, related_name="posts_visible", blank=True),
    )
    visible_to_groups = anonymizable(  # type: ignore[var-annotated]
        models.ManyToManyField(UserConnectionGroup, related_name="posts_visible", blank=True),
    )
    visibility = TextChoicesField(Visibility, default=Visibility.PRIVATE)

    # Content fields
    # ----------------------------------------------------------------------

    slug = AutoSlugField(populate_from="title", allow_duplicates=True)
    title = anonymizable(models.CharField(max_length=255, blank=True))
    content_direct = anonymizable(MarkdownField(blank=True))
    content_rant = anonymizable(MarkdownField(blank=True))
    content_private = anonymizable(MarkdownField(blank=True, help_text="Only for author"))
    # todo ? refac-name: content_default (considering HackerNews imports)
    content_polite = anonymizable(MarkdownField(blank=True))
    content_polite_html_ssr = anonymizable(
        models.TextField(blank=True, help_text="Used by FE to SSR 1000+ comments")
    )
    source = CharField(max_length=255, blank=True)
    source_author = CharField(max_length=500, blank=True)
    image = models.ImageField(upload_to="posts/images/", blank=True, null=True)

    # Tool fields
    # ----------------------------------------------------------------------

    class ToolType(models.TextChoices):
        Program = "program"
        Material = "material"
        SaaS = "saas"
        App = "app"
        Product = "product"
        Other = "other"

    company = models.ForeignKey(ToolCompany, on_delete=models.SET_NULL, null=True, blank=True)
    tool_type = TextChoicesField(ToolType, blank=True, null=True, default=None)
    domain = models.CharField(max_length=140, blank=True)
    url = models.URLField(blank=True)
    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    # Review fields
    # ----------------------------------------------------------------------

    review_tags = ManyToManyField("posts.PostTag", related_name="post_reviews", blank=True)
    review_rating = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Split on 5 categories: very dissatisfied, dissatisfied, neutral, satisfied, very satisfied",
    )
    review_experience_hours = models.PositiveIntegerField(blank=True, null=True)
    review_importance = models.PositiveIntegerField(blank=True, null=True)
    review_usage_status = TextChoicesField(
        UsageStatus,
        default=None,
        blank=True,
        null=True,
    )
    is_review_later = models.BooleanField(
        default=False,
        help_text="Would be better as a M2M with a through model on Post.users_read_later, but that's a bit too complex atm. It indicates a review with `content` that's more like a note re why User might want to review it or not.",
    )
    reviewed_at = anonymizable(models.DateTimeField(default=timezone.now))

    class Meta:
        ordering = ["-created_at"]

    class Perms:
        owner = "post_owner"

    history = HistoricalRecords(
        cascade_delete_history=True,
        excluded_fields=[
            "parent_root",
            "users_read_later",
            "users_library",
            "seen_by_users",
            "collapsed_by_users",
            "content_polite_html_ssr",
        ],
    )

    @model_property(cached=True, prefetch_related="root_children")
    def comment_count(self) -> int:
        return self.root_children.count()

    # Algolia
    # ----------------------------------------------------------------------

    def is_in_algolia_index(self) -> bool:
        return self.type is not self.Type.Comment

    def get_tag_values(self) -> list[str]:
        tags = [tag.name for tag in self.tags.all()]
        if self.type is self.Type.Review:
            assert self.parent
            tags.extend([tag.name for tag in self.parent.tags.all()])

        return tags

    def get_visible_to(self) -> list[str]:
        if self.visibility is Visibility.PRIVATE:
            assert self.author
            return [self.author.username]

        if self.visibility in [Visibility.INTERNAL, Visibility.PUBLIC]:
            return [f"group/{self.visibility.value}"]

        visible_to: list[str] = []

        if self.visibility in [Visibility.USERS_SELECTED, Visibility.CONNECTIONS]:
            # `list()` are only for Mypy #bad-infer
            visible_to.extend(list(*self.visible_to_users.all().values_list("username")))

        if self.visibility is Visibility.USERS_SELECTED:
            for group in self.visible_to_groups.all():
                visible_to.extend(list(*group.connections.all().values_list("username")))

        if self.visibility is Visibility.CONNECTIONS:
            assert self.author
            for group in self.author.connection_groups.all():
                visible_to.extend(list(*group.connections.all().values_list("username")))

        return visible_to

    def get_id_as_str(self) -> str:
        return str(self.id)

    def get_iso_created_at(self) -> str:
        return self.created_at.isoformat()

    def get_iso_updated_at(self) -> str:
        return self.updated_at.isoformat()

    def get_iso_reviewed_at(self) -> str | None:
        return self.reviewed_at.isoformat() if self.reviewed_at else None

    # Algolia needs Unix for sorting/filtering

    def get_unix_created_at(self) -> float:
        return self.created_at.timestamp()

    def get_unix_updated_at(self) -> float:
        return self.updated_at.timestamp()

    def get_unix_reviewed_at(self) -> float | None:
        return self.reviewed_at.timestamp() if self.reviewed_at else None

    def get_created_at_unix_aggregated(self) -> float:
        if hasattr(self, "post_source") and self.post_source.created_at_external:
            return self.post_source.created_at_external.timestamp()
        return self.created_at.timestamp()

    def get_votes_aggregated(self) -> int:
        votes_hn_count = 0
        if hasattr(self, "post_source"):
            votes_hn_count = self.post_source.score or 0

        config = PostConfig.get_solo()
        votes_pos = self.votes.filter(is_vote_positive=True).count()
        votes_neg = self.votes.filter(is_vote_positive=False).count()
        votes_adjusted = config.votes_multiplier * (votes_pos - votes_neg)

        return votes_hn_count + votes_adjusted

    def get_graphql_typename(self) -> str:
        if self.type is self.Type.Post:
            return f"{self.type.value.capitalize()}Type"
        else:
            return f"Post{self.type.value.capitalize()}Type"

    _algolia_graphql_cache: dict[str, Any] | None = {}

    def _get_graphql_field(self, field: str) -> Any | None:
        """
        We re-use the "{Type}ByIds" query to supply the identical JSON schema to FE from both Algolia and GraphQL.
        See [[Algolia.md]].

        Caches GraphQL to avoid N+1 in Algolia indexing.
        """
        from neuronhub.apps.tests.test_cases import StrawberryContext
        from neuronhub.graphql import schema

        if not self.is_in_algolia_index():  # should be redundant, but isn't
            return None

        if not self._algolia_graphql_cache:
            self._algolia_graphql_cache = {}

            query_name, resolver_key = {
                "post": ("PostsByIds", "posts"),
                "tool": ("ToolsByIds", "post_tools"),
                "review": ("ReviewsByIds", "post_reviews"),
            }.get(self.type, ("PostsByIds", "posts"))

            request = RequestFactory().get("/graphql")
            request.user = self.author or AnonymousUser()
            response = async_to_sync(schema.execute)(
                query=_load_client_persisted_queries_json()[query_name],
                variable_values={"ids": [self.pk]},
                context_value=StrawberryContext(request=request),
            )
            assert response.data
            if items := response.data[resolver_key]:
                self._algolia_graphql_cache = items[0]

        return self._algolia_graphql_cache.get(field)

    def get_image_json(self) -> dict | None:
        return self._get_graphql_field("image")

    def get_tags_json(self):
        return self._get_graphql_field("tags") or []

    def get_votes_json(self):
        return self._get_graphql_field("votes") or []

    def get_review_tags_json(self):
        return self._get_graphql_field("review_tags") or []

    def get_post_source_json(self) -> dict | None:
        return self._get_graphql_field("post_source")

    def get_author_json(self) -> dict | None:
        return self._get_graphql_field("author")

    def get_parent_json(self) -> dict | None:
        return self._get_graphql_field("parent")

    def get_has_github_url(self) -> bool:
        return bool(self.github_url)

    def __str__(self):
        match self.type:
            case Post.Type.Post | Post.Type.Tool:
                return f"[{self.type}] {self.title}"
            case Post.Type.Review:
                return f"[{self.type}] {self.title} [{self.review_rating}]"
            case Post.Type.Comment:
                return f"[{self.type}] {self.content_polite[:30]}"

        return f"{self.title}"


class PostConfig(SingletonModel):
    votes_multiplier = models.PositiveIntegerField(
        default=1,
        help_text="Since FE sort uses HackerNews votes (avg 100-800 per Post) - we multiply NHA Post votes by it to make them discoverable.",
    )

    class Meta:
        verbose_name = "Posts Config"

    def __str__(self):
        return "Posts Config"


@anonymizer.register
class PostVote(AnonimazableTimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_votes"
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)
    is_changed_my_mind = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["post", "author"]

    def __str__(self):
        return f"{self.post} - {self.author} [{self.is_vote_positive}]"


@anonymizer.register
class PostTag(AnonimazableTimeStampedModel):
    tag_parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tag_children",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="tags",
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=255)
    description = anonymizable(models.TextField(blank=True))

    is_review_tag = models.BooleanField(
        default=False,
        help_text=textwrap.dedent(
            """
            A special tag, shows the accumulative public opinion of the given topic, 
            with either positive '+' or negative '-' symbol and color. For a Software Tool it could be: 
            Privacy; Controversial; Mature; Expectation; FOSS, etc. 
            They're mostly defined the Django admins.
            """
        ),
    )
    is_important = models.BooleanField(
        default=False,
        help_text=textwrap.dedent(
            """
            A highly informative PostTag - shown before other tags with a visual icon 
            (eg macOS, Windows, TypeScript).
            And helps users to easily identify tools that work on their OS or tool. 
            A Post author could set it to place the Tag at the start of other tags.
            """
        ),
        null=True,
        blank=True,
    )

    class Meta:
        unique_together = ["tag_parent", "name"]

    @model_cached_property(
        only=["name", "tag_parent", "is_review_tag"],
        select_related=["tag_parent"],
    )
    def label(self) -> str:
        """
        # todo UX: @computed field + db_index=True

            from computedfields.models import ComputedFieldsModel, computed

            @computed(
                models.CharField(max_length=255),
                depends=[
                    ("self", ["name", "is_review_tag"]),
                    ("tag_parent", ["name"]),
                ],
            )
            def label(self):
                ...

        PS `GeneratedField` can't use `tag_parent`
        """
        if self.is_review_tag:
            try:
                # noinspection PyTypeChecker
                return ReviewTagName(self.name).label
            except ValueError:
                pass
        if self.tag_parent:
            return f"{self.tag_parent.name} / {self.name}"
        return self.name

    def __str__(self):
        if self.tag_parent:
            return f"{self.tag_parent} / {self.name}"
        return self.name


@anonymizer.register
class PostTagVote(AnonimazableTimeStampedModel):
    """
    A User's vote on a PostTag of the Post.
    """

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="tag_votes")
    tag = models.ForeignKey(PostTag, on_delete=models.CASCADE, related_name="votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_tag_votes"
    )

    comment = anonymizable(
        MarkdownField(blank=True, help_text="Eg clarifying author's opinion re the tag")
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)
    is_changed_my_mind = models.BooleanField(default=False)

    class Meta:
        unique_together = ["post", "tag", "author"]

    def __str__(self):
        return f"{self.tag} [{self.is_vote_positive}]"


# todo maybe: rename to PostRelatedVote (to indicate it's a Vote first of all)
@anonymizer.register
class PostRelated(AnonimazableTimeStampedModel):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    post = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="posts_related",
        related_query_name="post_related",
    )
    post_related = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="posts_related_to",
        related_query_name="post_related_to",
    )

    is_vote_positive = models.BooleanField(null=True, blank=True)
    comment = anonymizable(MarkdownField(blank=True))

    def __str__(self):
        return (
            f"{self.post} - {self.post_related} [pos={self.is_vote_positive.__str__().lower()}]"
        )
