from __future__ import annotations

import asyncio
import datetime
import logging
import textwrap
from dataclasses import dataclass

from django.utils import timezone

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models import UsageStatus
from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.tests.test_gen import Gen, UsersGen
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.tools import ToolCompanyOwnership
from neuronhub.apps.posts.services.create_tag import create_tag
from neuronhub.apps.users.models import User, UserConnectionGroup


logger = logging.getLogger(__name__)


async def db_stubs_repopulate(
    is_delete_posts: bool = True,
    is_delete_users_extra: bool = True,
    is_delete_user_default: bool = False,
) -> Gen:
    if is_delete_posts:
        for model in [
            PostTagVote,
            PostTag,
            PostVote,
            Post,
            PostRelated,
            ToolCompany,
            ToolCompanyOwnership,
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
    await _create_review_ghostly(user, alternatives=[tool_iterm], gen=gen)
    await _create_tool_and_post_unifi_network(user, gen=gen)
    await _create_tool_and_post_aider(user, gen=gen)
    return gen


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
    connected_1 = "u_connected_1"
    connected_2 = "u_connected_2"
    engineer_1 = "u_engineer_1"
    engineer_2 = "u_engineer_2"
    engineer_3 = "u_engineer_3"
    random_1 = "u_random_1"
    random_2 = "u_random_2"


async def _create_review_pycharm(user: User, gen: Gen):
    pycharm = await gen.posts.create(
        gen.posts.Params(
            type=Post.Type.Tool,
            title="PyCharm",
            tool_type=Post.ToolType.Program,
            crunchbase_url="crunchbase.com/organization/jetbrains",
            content=textwrap.dedent(
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

    review = await Post.objects.acreate(
        type=Post.Type.Review,
        parent=pycharm,
        author=user,
        title="Fine, haven't seen better for Python or Django",
        content=textwrap.dedent(
            """
            - Better than VS Code for Python
            - Python/Django stubs and completions
            - Debugger
            - Git UI and shortcuts
            - JS/TS integration performance has been improving, but still not as good as VS Code
            - Bugs are frequent. Less than in VS Code, but still a lot
            """
        ),
        review_usage_status=UsageStatus.USING,
        review_rating=67,
        review_importance=83,
        review_experience_hours=17_000,
        reviewed_at=timezone.now(),
        visibility=Visibility.PUBLIC,
    )
    tag_web_dev = "Dev / Web Development"
    tag_django = "Dev / Django"
    await _create_tags(
        post=pycharm,
        author=await gen.users.user(username=users.random_1, is_get_or_create=True),
        params=[
            TagParams("Software / IDE", is_important=True),
            TagParams("Dev / Kotlin"),
            TagParams("Dev / TypeScript"),
            TagParams("Dev / Database"),
            TagParams(tag_web_dev, is_vote_pos=True),
            TagParams(tag_django),
            TagParams("Dev / JavaScript"),
            TagParams("Dev / JetBrains", is_important=True),
            TagParams("Dev / Java"),
            TagParams("Business / Subscription"),
            TagParams("Business / Paid"),
            TagParams("Business / Free Trial"),
        ],
    )
    await _create_tags(
        post=review,
        author=user,
        params=[
            # repeat tags
            TagParams(tag_web_dev, is_vote_pos=True),
            TagParams(tag_django, is_vote_pos=True),
            TagParams("Dev / Open Source Core"),
            TagParams("Dev / Python", is_vote_pos=True),
        ],
    )
    await _create_review_tags(
        post=review,
        params=[
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(ReviewTagName.value, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.ease_of_use, is_vote_pos=False),
        ],
    )
    comment = await gen.posts.create(
        gen.posts.Params(Post.Type.Comment, parent=review, author=user)
    )
    # Add nested comment (reply)
    await gen.posts.create(
        gen.posts.Params(
            Post.Type.Comment,
            parent=comment,
            author=user,
            content="VS Code has better extensions ecosystem, but PyCharm has superior debugging and refactoring capabilities for Python projects.",
        )
    )


async def _create_review_iterm(user: User, gen: Gen):
    tool = await gen.posts.create(
        gen.posts.Params(
            title="iTerm2",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            crunchbase_url="crunchbase.com/organization/iterm2",
            github_url="github.com/gnachman/iTerm2",
            content="iTerm2 is a terminal emulator for macOS that does amazing things. It brings the terminal into "
            "the modern age with features you never knew you always wanted.",
            company_name="iTerm2",
            company_domain="iterm2.com",
            company_country="US",
            is_single_product=True,
            company_ownership_name="Private",
        )
    )

    await _create_tags(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Terminal emulator", is_vote_pos=True, is_important=True),
            TagParams("Dev / License / GPL v2", is_vote_pos=True, is_important=True),
            TagParams("Dev / CLI"),
            TagParams("OS / Linux", is_vote_pos=False, is_important=True),
            TagParams("OS / macOS", is_important=True),
        ],
    )

    review = await Post.objects.acreate(
        type=Post.Type.Review,
        parent=tool,
        author=user,
        title="Good shortcuts and render config, actively maintained",
        content=textwrap.dedent(
            """
            - Fast native render (Objective-C/Swift)
            - no extra features, like history/fish/llm/etc
            """
        ),
        review_usage_status=UsageStatus.USING,
        review_rating=75,
        review_importance=51,
        review_experience_hours=7_000,
        reviewed_at=timezone.now() - datetime.timedelta(days=10),
        visibility=Visibility.PUBLIC,
    )
    await gen.posts.create(
        gen.posts.Params(
            Post.Type.Comment,
            parent=review,
            author=user,
            content="Have you tried the GPU rendering option? It makes scrolling buttery smooth.",
        )
    )

    await _create_review_tags(
        post=review,
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
            github_url="github.com/ghostty-org/ghostty",
            content="Ghostty is a terminal emulator that differentiates itself by being fast, feature-rich, "
            "and native.Performance is a category where people start getting really argumentative, "
            "so the only claim I make is that Ghostty aims to be in the same class as the fastest terminal "
            "emulators",
        )
    )

    if alternatives:
        await tool.alternatives.aadd(*alternatives)

    await _create_tags(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Terminal emulator", is_vote_pos=True),
            TagParams("OS / Linux", is_vote_pos=True),
            TagParams("OS / macOS", is_vote_pos=True),
            TagParams("Dev / Zig"),
            TagParams("Dev / Swift"),
            TagParams("Dev / License / MIT", is_important=True),
        ],
    )

    review = await Post.objects.acreate(
        type=Post.Type.Review,
        parent=tool,
        author=user,
        title="Haven't tried, heard good things from HN - embeddable, Zig-based",
        review_usage_status=UsageStatus.INTERESTED,
        reviewed_at=timezone.now() - datetime.timedelta(days=35),
        visibility=Visibility.PUBLIC,
    )
    comment = await gen.posts.comment(parent=review, author=user)
    await gen.posts.comment(parent=comment, author=user)
    await _create_review_tags(
        post=review,
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
            content="Ubiquiti UniFi Network Application for managing UniFi networking devices.",
            url="ui.com/cloud-gateways",
            company_name="Ubiquiti",
            company_domain="ui.com",
            company_country="US",
            company_ownership_name="Public",
        )
    )
    await _create_tags(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Network", is_vote_pos=True),
            TagParams("Dev / Self-host", is_important=True, is_vote_pos=True),
            TagParams("Dev / License / Closed-source"),
        ],
    )
    await gen.posts.create(
        gen.posts.Params(
            title="UniFi Network leaks IP of VPN clients despite Policy-Based Routing, only hacking can fix this",
            content=textwrap.dedent(
                """
                From LLM:
                > 1. No UI solution - requires custom scripts that survive firmware updates and enforce routing rules, 
                eg see the dead github.com/peacey/split-vpn
                > 2. Can create a separate VLAN for VPN traffic with custom policy routing through config.gateway.json
                """
            ),
            parent=tool,
            author=user,
        )
    )
    return tool


async def _create_tool_and_post_aider(user: User, gen: Gen) -> Post:
    tool = await gen.posts.create(
        gen.posts.Params(
            title="Aider",
            type=Post.Type.Tool,
            tool_type=Post.ToolType.Program,
            content="Aider is most popular on HN CLI-first AI coder wrapper. Owned by one angel SWE, for now anyway.",
            url="aider.chat",
            github_url="github.com/paul-gauthier/aider",
            company_name="Aider",
            company_domain="aider.chat",
            is_single_product=True,
            company_ownership_name="Private",
        )
    )
    await _create_tags(
        post=tool,
        author=user,
        params=[
            TagParams("Software / Dev Tool", is_vote_pos=True),
            TagParams("Dev / AI", is_vote_pos=True),
            TagParams("Dev / CLI", is_vote_pos=True),
            TagParams("Dev / License / Apache 2", is_important=True),
        ],
    )
    await gen.posts.create(
        gen.posts.Params(
            title="Aider leaderboards are becoming popular on HN for new models assessment",
            content="https://aider.chat/docs/leaderboards",
            parent=tool,
            author=user,
        )
    )
    return tool


async def create_company_ownership(name: str) -> ToolCompanyOwnership:
    ownership, _ = await ToolCompanyOwnership.objects.aget_or_create(name=name)
    return ownership


@dataclass
class TagParams:
    name: str
    is_vote_pos: bool | None = None
    is_important: bool | None = None


async def _create_tags(post: Post, author: User, params: list[TagParams]):
    await asyncio.gather(
        *[
            create_tag(
                name_raw=param.name,
                post=post,
                author=author,
                is_vote_positive=param.is_vote_pos,
                is_important=param.is_important,
            )
            for param in params
        ]
    )


@dataclass
class ReviewTagParams:
    name: ReviewTagName
    is_vote_pos: bool | None = None


async def _create_review_tags(post: Post, params: list[ReviewTagParams]):
    await asyncio.gather(*[_create_review_tag(post, param) for param in params])


async def _create_review_tag(post: Post, param: ReviewTagParams):
    if param.is_vote_pos is not None:
        tag, _ = await PostTag.objects.aget_or_create(
            name=param.name.value,
            defaults=dict(is_review_tag=True, author=post.author),
        )
        await post.review_tags.aadd(tag)
        await PostTagVote.objects.acreate(
            post=post,
            tag=tag,
            author=post.author,
            is_vote_positive=param.is_vote_pos,
        )
