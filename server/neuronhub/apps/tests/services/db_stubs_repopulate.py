import asyncio
import datetime
import logging
import textwrap
from contextlib import ContextDecorator
from dataclasses import dataclass

from asgiref.sync import sync_to_async
from django.conf import settings
from django.utils import timezone

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models import PostCategory
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models import UsageStatus
from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.tools import ToolCompanyOwnership
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.tests.test_gen import UsersGen
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


logger = logging.getLogger(__name__)


post_HN_id = 45487476


async def db_stubs_repopulate(
    is_delete_posts: bool = True,
    is_delete_posts_extra: bool = True,
    is_delete_users_extra: bool = True,
    is_delete_user_default: bool = False,
    is_delete_profiles: bool = True,
    is_create_single_review: bool | None = False,
    is_import_HN_post: bool | None = True,
    is_import_profiles_csv: bool = True,
) -> Gen:
    """
    Populates the db with Posts, Tools, Reviews, tags, votes, etc.

    E2E tests run on it, so it includes edge cases.
    """

    with _disable_auto_indexing():
        if is_delete_posts_extra:
            for model in [
                PostHighlight,
                PostRelated,
                ToolCompany,
                ToolCompanyOwnership,
            ]:
                await model._default_manager.all().adelete()

        if is_delete_posts:
            # for E2E keep others to preserve IDs for Algolia # todo ! refac: #prob-redundant, i don't believe we use that strategy at all - we just reset all
            for model in [
                PostTagVote,
                PostTag,
                PostVote,
                Post,
                PostSource,
                UserSource,
            ]:
                await model._default_manager.all().adelete()

        if is_delete_profiles:
            for model in [
                ProfileMatch,
                ProfileInvite,
                Profile,
                ProfileGroup,
            ]:
                await model._default_manager.all().adelete()

        if is_delete_user_default:
            await User.objects.all().adelete()
            await Org.objects.all().adelete()

        if is_delete_users_extra:
            await UserConnectionGroup.objects.all().adelete()
            await User.objects.exclude(username=UsersGen._user_username).adelete()

        gen = await Gen.create(is_user_default_superuser=True)
        user = gen.users.user_default

        if is_delete_users_extra:
            await _create_users(gen)

        await _create_review_pycharm(user, gen=gen)

        tool_iterm = await _create_review_iterm(user, gen=gen)

        await _create_post_news(user, gen=gen)

        if not is_create_single_review:
            await _create_review_ghostly(user, alternatives=[tool_iterm], gen=gen)
            await _create_tool_and_post_unifi_network(user, gen=gen)
            await _create_tool_and_post_aider(user, gen=gen)

        if is_import_HN_post:
            # todo refac: do only on request, as it adds +3s
            post_with_90_comments_and_idents = post_HN_id
            importer = ImporterHackerNews(is_use_cache=True, is_logging_enabled=False)
            await importer.import_post(post_with_90_comments_and_idents)

        if is_import_profiles_csv:
            await _import_profiles_csv(gen)

    if settings.ALGOLIA["IS_ENABLED"]:
        await _algolia_reindex(
            is_import_profiles_csv=is_import_profiles_csv,
            is_import_HN_post=is_import_HN_post,
        )

    return gen


async def _import_profiles_csv(gen: Gen):
    from asgiref.sync import sync_to_async

    from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import

    csv_path = settings.CONF_CONFIG.eag_csv_path
    if csv_path.exists():
        await sync_to_async(csv_optimize_and_import)(csv_path, limit=5)


# todo ! refac: move out
async def _algolia_reindex(
    is_import_profiles_csv: bool = True,
    is_import_HN_post: bool = True,
):
    from algoliasearch_django import reindex_all

    from neuronhub.apps.posts.index import setup_virtual_replica_sorted_by_votes

    # todo refac: replace with a [[index.py]] method
    if is_import_HN_post:
        await sync_to_async(reindex_all)(Post)
    if is_import_profiles_csv:
        await sync_to_async(reindex_all)(Profile)

    if is_import_HN_post or is_import_profiles_csv:
        await sync_to_async(setup_virtual_replica_sorted_by_votes)()


class _disable_auto_indexing(ContextDecorator):
    """
    Lazy import, as algoliasearch_django crashes if settings.ALGOLIA_API_KEY is missing.
    """

    decorator: ContextDecorator

    def __enter__(self):
        if settings.ALGOLIA["IS_ENABLED"]:
            from algoliasearch_django.decorators import disable_auto_indexing

            self.decorator = disable_auto_indexing()
            self.decorator.__enter__()

    def __exit__(self, exc_type, exc_value, traceback):
        if settings.ALGOLIA["IS_ENABLED"]:
            self.decorator.__exit__(exc_type, exc_value, traceback)


async def _create_users(gen: Gen):
    user = gen.users.user_default

    # Aliases

    await gen.users.alias(user, is_get_or_create=True)
    await gen.users.alias(user, is_get_or_create=True)

    # Connections

    group_default, _ = await user.connection_groups.aget_or_create(
        name=UserConnectionGroup.NAME_DEFAULT,
        user=user,
    )
    user_connected_1 = await gen.users.user(username=users.connected_1, is_get_or_create=True)
    user_connected_2 = await gen.users.user(username=users.connected_2, is_get_or_create=True)
    await group_default.connections.aadd(user_connected_1, user_connected_2)

    group_engineers, _ = await user.connection_groups.aget_or_create(
        name="Engineers",
        user=user,
    )
    user_engineer_1 = await gen.users.user(username=users.engineer_1, is_get_or_create=True)
    user_engineer_2 = await gen.users.user(username=users.engineer_2, is_get_or_create=True)
    user_engineer_3 = await gen.users.user(username=users.engineer_3, is_get_or_create=True)
    await group_engineers.connections.aadd(user_engineer_1, user_engineer_2, user_engineer_3)

    await gen.users.user(username=users.random_1, is_get_or_create=True)
    await gen.users.user(username=users.random_2, is_get_or_create=True)


@dataclass
class users:
    connected_1 = "john_connected"
    connected_2 = "max_connected"
    engineer_1 = "david_swe"
    engineer_2 = "dane_swe"
    engineer_3 = "dove_swe"
    random_1 = "mark_random"
    random_2 = "mole_random"


async def _create_review_pycharm(user: User, gen: Gen):
    pycharm = await gen.posts.create(
        gen.posts.Params(
            type=Post.Type.Tool,
            title="PyCharm",
            tool_type=Post.ToolType.Program,
            crunchbase_url="crunchbase.com/organization/jetbrains",
            content_polite=textwrap.dedent(
                """
                PyCharm is an integrated development environment (IDE) used in computer programming,
                specifically for the Python language. It is developed by the Czech company JetBrains.
                """
            ),
            url="jetbrains.com/pycharm",
            company_name="JetBrains",
            company_domain="jetbrains.com",
            company_country="NL",
            company_ownership_name="Private",
            visibility=Visibility.PUBLIC,
        )
    )

    review, _ = await Post.objects.aupdate_or_create(
        title="Fine, haven't seen better for Python or Django",
        type=Post.Type.Review,
        defaults=dict(
            parent=pycharm,
            author=user,
            content_polite=textwrap.dedent(
                """
                - Better than VS Code for Python
                - Python/Django stubs and completions
                - Debugger
                - Git UI and shortcuts
                - JS/TS integration performance has been improving, but still not as good as VS Code
                - Bugs are frequent. Less than in VS Code, but still a lot
                """
            ),
            content_direct=textwrap.dedent(
                """
                - Best IDE for Python/Django. Period.
                - Debugger works, VS Code's doesn't
                - JS/TS support still meh, bugs in every release
                """
            ),
            review_usage_status=UsageStatus.USING,
            review_rating=67,
            review_importance=83,
            review_experience_hours=17_000,
            reviewed_at=timezone.now(),
            visibility=Visibility.PUBLIC,
        ),
    )
    await _tags_create_or_update(
        post=pycharm,
        author=await gen.users.user(username=users.random_1, is_get_or_create=True),
        params=[
            TagParams("Software / IDE", is_important=True),
            TagParams("Dev / TypeScript"),
            TagParams("Dev / Database"),
            TagParams(tags.kotlin),
            TagParams(tags.web_dev, is_vote_pos=True),
            TagParams(tags.django),
            TagParams("Dev / JavaScript"),
            TagParams("Dev / JetBrains", is_important=True),
            TagParams("Dev / Java"),
            TagParams("Business / Subscription"),
            TagParams("Business / Paid"),
            TagParams("Business / Free Trial"),
        ],
    )
    await _tags_create_or_update(
        post=pycharm,
        author=user,
        params=[
            TagParams(tags.kotlin, is_vote_pos=True),
        ],
    )
    await _tags_create_or_update(
        post=review,
        author=user,
        params=[
            # repeat tags
            TagParams(tags.web_dev, is_vote_pos=True),
            TagParams(tags.django, is_vote_pos=True),
            TagParams("Dev / Open Source Core"),
            TagParams(tags.python, is_vote_pos=True),
        ],
    )
    await _review_tags_create_or_update(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(ReviewTagName.value, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.ease_of_use, is_vote_pos=False),
        ],
    )
    comment = await gen.posts.comment(review, author=user)
    nested_comment = await gen.posts.comment(
        review,
        parent=comment,
        author=user,
        content_polite="VS Code has better extensions ecosystem, but PyCharm has superior debugging and refactoring capabilities for Python projects.",
    )
    # todo ! use f"" strings #AI-slop
    # Create a highlight on the nested comment
    await PostHighlight.objects.acreate(
        post=nested_comment,
        user=user,
        text="superior debugging and refactoring capabilities",
        text_prefix="PyCharm has ",
        text_postfix=" for Python",
    )

    await nested_comment.collapsed_by_users.aadd(user)


async def _create_review_iterm(user: User, gen: Gen):
    tool = await gen.posts.create(
        gen.posts.Params(
            title="iTerm2",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            crunchbase_url="crunchbase.com/organization/iterm2",
            github_url="github.com/gnachman/iTerm2",
            content_polite="iTerm2 is a terminal emulator for macOS that does amazing things. It brings the terminal into "
            "the modern age with features you never knew you always wanted.",
            company_name="iTerm2",
            company_domain="iterm2.com",
            company_country="US",
            is_single_product=True,
            company_ownership_name="Private",
        )
    )

    await _tags_create_or_update(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Terminal emulator", is_vote_pos=True, is_important=True),
            TagParams("Dev / License / GPL v2", is_vote_pos=True, is_important=True),
            TagParams("Dev / CLI"),
            TagParams("OS / Linux", is_vote_pos=False, is_important=True),
            TagParams(tags.macos, is_important=True),
        ],
    )

    review, _ = await Post.objects.aupdate_or_create(
        title="Good shortcuts and render config, actively maintained",
        type=Post.Type.Review,
        defaults=dict(
            parent=tool,
            author=user,
            content_polite=textwrap.dedent(
                """
                - Fast native render (Objective-C/Swift)
                - no extra features, like history/fish/llm/etc
                """
            ),
            content_rant=textwrap.dedent(
                """
                - Stop adding AI/LLM bullshit to terminals
                """
            ),
            review_usage_status=UsageStatus.USING,
            review_rating=75,
            review_importance=51,
            review_experience_hours=7_000,
            reviewed_at=timezone.now() - datetime.timedelta(days=10),
            visibility=Visibility.PUBLIC,
        ),
    )
    await _tags_create_or_update(
        post=review,
        author=user,
        params=[TagParams(tags.macos, is_vote_pos=True)],
    )
    iterm_comment = await gen.posts.comment(
        review,
        author=user,
        content_polite="Have you tried the GPU rendering option? It makes scrolling buttery smooth.",
    )
    # todo ! use f"" strings #AI-slop
    # Create a highlight on this comment
    await PostHighlight.objects.acreate(
        post=iterm_comment,
        user=user,
        text="GPU rendering option",
        text_prefix="tried the ",
        text_postfix="? It makes",
    )

    await _review_tags_create_or_update(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.open_source, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=True),
        ],
    )

    return tool


async def _create_review_ghostly(user: User, gen: Gen, alternatives: list[Post] = None):
    tool = await gen.posts.create(
        gen.posts.Params(
            title="Ghostty",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            visibility=Visibility.INTERNAL,
            github_url="github.com/ghostty-org/ghostty",
            content_polite="Ghostty is a terminal emulator that differentiates itself by being fast, feature-rich, "
            "and native.Performance is a category where people start getting really argumentative, "
            "so the only claim I make is that Ghostty aims to be in the same class as the fastest terminal "
            "emulators",
        )
    )

    if alternatives:
        await tool.alternatives.aadd(*alternatives)

    await _tags_create_or_update(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Terminal emulator", is_vote_pos=True),
            TagParams("OS / Linux", is_vote_pos=True),
            TagParams(tags.macos, is_vote_pos=True),
            TagParams("Dev / Zig"),
            TagParams("Dev / Swift"),
            TagParams("Dev / License / MIT", is_important=True),
        ],
    )

    review, _ = await Post.objects.aupdate_or_create(
        title="Haven't tried, heard good things from HN - embeddable, Zig-based",
        type=Post.Type.Review,
        defaults=dict(
            parent=tool,
            author=user,
            review_usage_status=UsageStatus.INTERESTED,
            reviewed_at=timezone.now() - datetime.timedelta(days=35),
            visibility=Visibility.PUBLIC,
        ),
    )
    comment = await gen.posts.comment(review, author=user)
    await gen.posts.comment(review, parent=comment, author=user)
    await _review_tags_create_or_update(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=True),
        ],
    )


async def _create_tool_and_post_unifi_network(user: User, gen: Gen) -> Post:
    tool = await gen.posts.create(
        gen.posts.Params(
            title="UniFi Network",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            content_polite="Ubiquiti UniFi Network Application for managing UniFi networking devices.",
            url="ui.com/cloud-gateways",
            company_name="Ubiquiti",
            company_domain="ui.com",
            company_country="US",
            company_ownership_name="Public",
            visibility=Visibility.INTERNAL,
        )
    )
    await _tags_create_or_update(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Network", is_vote_pos=True),
            TagParams("Dev / Self-host", is_important=True, is_vote_pos=True),
            TagParams("Dev / License / Closed-source"),
        ],
    )
    post = await gen.posts.post(
        gen.posts.Params(
            category=PostCategory.Knowledge,
            title="UniFi Network leaks IP of VPN clients despite Policy-Based Routing, only hacking can fix this",
            content_polite=textwrap.dedent(
                """
                From LLM:
                > - No UI solution - requires custom scripts that survive firmware updates and enforce routing rules, eg see the dead github.com/peacey/split-vpn
                > - Can create a separate VLAN for VPN traffic with custom policy routing through config.gateway.json
                """
            ),
            content_direct="Policy Routing is fucked - IP leaks; They admit it's shit",
            parent=tool,
            author=user,
            visibility=Visibility.INTERNAL,
        )
    )
    await _tags_create_or_update(
        post=post,
        author=user,
        params=[
            TagParams("Dev / VPN"),
            TagParams("Dev / Security", is_important=True),
            TagParams("Software / Network", is_vote_pos=True),
        ],
    )
    await PostVote.objects.acreate(
        post=post,
        author=user,
        is_vote_positive=False,
    )
    return tool


async def _create_tool_and_post_aider(user: User, gen: Gen) -> Post:
    tool = await gen.posts.create(
        gen.posts.Params(
            title="Aider",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            content_polite="Aider is most popular on HN CLI-first AI coder wrapper. Owned by one angel SWE, for now anyway.",
            url="aider.chat",
            github_url="github.com/paul-gauthier/aider",
            company_name="Aider",
            company_domain="aider.chat",
            is_single_product=True,
            company_ownership_name="Private",
        )
    )
    await _tags_create_or_update(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Dev Tool", is_vote_pos=True),
            TagParams("Dev / AI", is_vote_pos=True),
            TagParams("Dev / CLI", is_vote_pos=True),
            TagParams("Dev / License / Apache 2", is_important=True),
        ],
    )
    post = await gen.posts.post(
        gen.posts.Params(
            title="Aider leaderboards are becoming popular on HN for new models assessment",
            content_polite="https://aider.chat/docs/leaderboards",
            category=PostCategory.Opinion,
            parent=tool,
            author=user,
            visibility=Visibility.INTERNAL,
        )
    )
    await _tags_create_or_update(
        post=post,
        author=user,
        params=[
            TagParams("Dev / AI", is_vote_pos=True),
            TagParams("Dev / Benchmarks"),
            TagParams("Community / HackerNews", is_vote_pos=True),
        ],
    )
    await PostVote.objects.acreate(
        post=post,
        author=user,
        is_vote_positive=True,
    )
    return tool


async def _create_post_news(user: User, gen: Gen) -> Post:
    post = await gen.posts.post(
        gen.posts.Params(
            title="Django 5.2 LTS released with async improvements and enhanced ORM capabilities",
            content_polite=textwrap.dedent(
                """
                Django 5.2 has been released as a Long-Term Support (LTS) version with significant improvements:
                - Enhanced async support for views and middleware
                - Improved ORM performance with better query optimization
                - New database backends support and better PostgreSQL integration
                - Security updates and bug fixes

                This release will receive extended support until April 2028.
                """
            ),
            content_direct=textwrap.dedent(
                """
                Django 5.2 LTS just dropped:
                - Finally better async support
                - ORM got faster
                - PostgreSQL improvements
                - Supported until 2028
                """
            ),
            category=PostCategory.News,
            author=user,
            visibility=Visibility.PUBLIC,
        )
    )
    await _tags_create_or_update(
        post=post,
        author=user,
        params=[
            TagParams(tags.django, is_vote_pos=True, is_important=True),
            TagParams(tags.python, is_vote_pos=True),
            TagParams("Dev / Web Framework", is_vote_pos=True),
            TagParams("Software / Release", is_important=True),
        ],
    )
    await PostVote.objects.acreate(
        post=post,
        author=user,
        is_vote_positive=True,
    )
    return post


async def create_company_ownership(name: str) -> ToolCompanyOwnership:
    ownership, _ = await ToolCompanyOwnership.objects.aget_or_create(name=name)
    return ownership


@dataclass
class TagParams:
    name: str
    is_vote_pos: bool | None = None
    is_important: bool | None = None


async def _tags_create_or_update(post: Post, author: User, params: list[TagParams]):
    tags_new = await asyncio.gather(
        *[
            tag_create_or_update(
                name_raw=param.name,
                post=post,
                author=author,
                is_vote_positive=param.is_vote_pos,
                is_important=param.is_important,
            )
            for param in params
        ]
    )
    await post.tags.aadd(*tags_new)


@dataclass
class ReviewTagParams:
    name: ReviewTagName
    is_vote_pos: bool


async def _review_tags_create_or_update(review: Post, params: list[ReviewTagParams]):
    tags = await asyncio.gather(
        *[
            tag_create_or_update(
                post=review,
                name_raw=param.name,
                author=review.author,
                is_vote_positive=param.is_vote_pos,
                is_review_tag=True,
            )
            for param in params
        ]
    )
    await review.review_tags.aadd(*tags)


class tags:
    macos = "OS / macOS"
    django = "Dev / Django"
    web_dev = "Dev / Web Development"
    python = "Dev / Python"
    jetbrains = "Dev / JetBrains"
    kotlin = "Dev / Kotlin"
    hacker_news = "Source / HackerNews"
