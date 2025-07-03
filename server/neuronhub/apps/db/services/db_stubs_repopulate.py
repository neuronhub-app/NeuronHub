from __future__ import annotations

import asyncio
import dataclasses
import datetime
import logging
import textwrap

from asgiref.sync import sync_to_async
from django.utils import timezone

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models import UsageStatus
from neuronhub.apps.posts.models.posts import Post  # Import Post model
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.tools import ToolCompanyOwnership
from neuronhub.apps.posts.services.create_tag import create_tag
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def db_stubs_repopulate(
    is_delete_posts: bool = False,
    is_delete_users: bool = False,
    is_delete_orgs: bool = False,
) -> None:
    if is_delete_posts:
        for model in [
            # posts:
            PostTagVote,
            PostTag,
            PostVote,
            Post,
            PostRelated,
            ToolCompany,
        ]:
            await model._default_manager.all().adelete()

    if is_delete_orgs:
        await Org.objects.all().adelete()

    if is_delete_users:
        await User.objects.all().adelete()

    gen = await Gen.create(is_user_default_superuser=True)
    user = gen.users.user_default

    await _create_review_pycharm(user, gen=gen)
    tool_iterm = await _create_review_iterm(user, gen=gen)
    await _create_review_ghostly(user, alternatives=[tool_iterm], gen=gen)
    tool_unifi = await _create_tool_unifi_network(user, gen=gen)
    tool_aider = await _create_tool_aider(user, gen=gen)

    # Create Posts
    await _create_posts(user, gen=gen, post_unifi=tool_unifi, post_aider=tool_aider)


async def _create_review_pycharm(user: User, gen: Gen):
    pycharm = await gen.posts.create(
        gen.posts.Params(
            type=Post.Type.Tool,
            title="PyCharm",
            tool_type=Post.ToolType.Program,
            crunchbase_url="crunchbase.com/organization/jetbrains",
            content="PyCharm is an integrated development environment (IDE) used in computer programming, "
            "specifically "
            "for the Python language. It is developed by the Czech company JetBrains.",
            url="jetbrains.com/pycharm",
            company_name="JetBrains",
            company_domain="jetbrains.com",
            company_country="NL",
            company_ownership_name="Private",
            visibility=Visibility.PUBLIC,
        )
    )

    await create_tags(
        tool=pycharm,
        author=user,
        params=[
            TagParams("Software / IDE", is_vote_pos=True, is_important=True),
            TagParams("Dev / Python", is_vote_pos=True, is_important=True),
            TagParams("Dev / Kotlin"),
            TagParams("Dev / TypeScript"),
            TagParams("Dev / Database"),
            TagParams("Dev / Django", is_important=True, is_vote_pos=True),
            TagParams("Dev / Web Development", is_vote_pos=True),
            TagParams("Dev / JavaScript"),
            TagParams("Dev / JetBrains", is_important=True),
            TagParams("Dev / Java"),
            TagParams("Dev / Open Source Core"),
            TagParams("Business / Subscription"),
            TagParams("Business / Paid"),
            TagParams("Business / Free Trial"),
        ],
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
        reviewed_at=timezone.now() - datetime.timedelta(days=8, hours=5, minutes=30),
        visibility=Visibility.PUBLIC,
    )
    await create_review_tags(
        post=review,
        params=[
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(ReviewTagName.value, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.a_must_have, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.ease_of_use, is_vote_pos=False),
        ],
    )
    await gen.posts.create(gen.posts.Params(Post.Type.Comment, parent=review, author=user))


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

    await create_tags(
        tool=tool,
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
        visibility=Visibility.PUBLIC,
    )
    await create_review_tags(
        post=review,
        params=[
            ReviewTagParams(ReviewTagName.open_source, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=False),
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
        await sync_to_async(tool.alternatives.add)(*alternatives)

    await create_tags(
        tool=tool,
        author=user,
        params=[
            TagParams("Software / Terminal emulator", is_vote_pos=True, is_important=True),
            TagParams("OS / Linux", is_vote_pos=True),
            TagParams("OS / macOS"),
            TagParams("OS / macOS / Native"),
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
    await create_review_tags(
        post=review,
        params=[
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=True),
        ],
    )


async def _create_tool_unifi_network(user: User, gen: Gen) -> Post:
    tool = await gen.posts.create(
        gen.posts.Params(
            title="UniFi Network)",
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
    await create_tags(
        tool=tool,
        author=user,
        params=[
            TagParams("Software / Network Management", is_vote_pos=True, is_important=True),
            TagParams("Hardware / Networking", is_vote_pos=True),
            TagParams("Business / License-free", is_vote_pos=True),
            TagParams("Dev / Self-hosted", is_important=True, is_vote_pos=True),
            TagParams("Dev / License / Proprietary"),
        ],
    )
    return tool


async def _create_tool_aider(user: User, gen: Gen) -> Post:
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
    await create_tags(
        tool=tool,
        author=user,
        params=[
            TagParams("Software / Dev Tool", is_vote_pos=True, is_important=True),
            TagParams("Dev / AI", is_vote_pos=True),
            TagParams("Dev / CLI", is_vote_pos=True),
            TagParams("Dev / Python"),
            TagParams("Dev / License / Apache 2.0", is_important=True),
        ],
    )
    return tool


async def _create_posts(user: User, gen: Gen, post_unifi: Post, post_aider: Post):
    await gen.posts.create(
        gen.posts.Params(
            title="UniFi Network leaks IP of VPN clients despite Policy-Based Routing, only hacking can fix this)",
            content=textwrap.dedent(
                """
                From LLM:
                > 1. No UI solution - requires custom scripts that survive firmware updates and enforce routing rules, 
                eg see the dead github.com/peacey/split-vpn
                > 2. Can create a separate VLAN for VPN traffic with custom policy routing through config.gateway.json
                """
            ),
            parent=post_unifi,
            author=user,
        )
    )

    await gen.posts.create(
        gen.posts.Params(
            title="Aider leaderboards are becoming popular on HN for new models assessment)",
            content="https://aider.chat/docs/leaderboards",
            parent=post_aider,
            author=user,
        )
    )


async def create_company_ownership(name: str) -> ToolCompanyOwnership:
    ownership, _ = await ToolCompanyOwnership.objects.aget_or_create(name=name)
    return ownership


@dataclasses.dataclass
class TagParams:
    name: str
    is_vote_pos: bool | None = None
    is_important: bool = False


async def create_tags(tool: Post, author: User, params: list[TagParams]):
    await asyncio.gather(
        *[
            create_tag(
                name_raw=param.name,
                post=tool,
                author=author,
                is_vote_positive=param.is_vote_pos,
                is_important=param.is_important,
            )
            for param in params
        ]
    )


@dataclasses.dataclass
class ReviewTagParams:
    name: ReviewTagName
    is_vote_pos: bool | None = None


async def create_review_tags(post: Post, params: list[ReviewTagParams]):
    tag, _ = await PostTag.objects.aget_or_create(
        name=ReviewTagName.expectations.value,
        defaults={
            "is_review_tag": True,
        },
    )
    await asyncio.gather(
        *[
            PostTagVote.objects.acreate(
                post=post,
                tag=tag,
                is_vote_positive=param.is_vote_pos,
            )
            for param in params
        ]
    )
