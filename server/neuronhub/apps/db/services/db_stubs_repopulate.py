import asyncio
import dataclasses
import datetime
import logging
import textwrap

from asgiref.sync import sync_to_async
from django.utils import timezone

from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.tools.models import Company
from neuronhub.apps.tools.models import CompanyOwnership
from neuronhub.apps.tools.models import ReviewTagName
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolAlternative
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolReviewTag
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.tools.models import UsageStatus
from neuronhub.apps.tools.services.create_tag import create_tag
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def db_stubs_repopulate(
    is_delete_tools: bool = False,
    is_delete_users: bool = False,
    is_delete_orgs: bool = False,
) -> None:
    if is_delete_tools:
        await ToolTagVote.objects.all().adelete()
        await ToolTag.objects.all().adelete()
        await ToolAlternative.objects.all().adelete()
        await ToolReview.objects.all().adelete()
        await Tool.objects.all().adelete()
        await Company.objects.all().adelete()

    if is_delete_orgs:
        # todo[+](test) restore orgs
        await Org.objects.all().adelete()

    if is_delete_users:
        await User.objects.all().adelete()

    gen = await Gen.create()
    user = await gen.users.get_user_default()

    await _create_review_pycharm(user, gen=gen)
    tool = await _create_review_iterm(user)
    await _create_review_ghostly(user, alternatives=[tool])


async def _create_review_pycharm(user: User, gen: Gen):
    pycharm = await Tool.objects.acreate(
        name="PyCharm",
        type="Program",
        crunchbase_url="crunchbase.com/organization/jetbrains",
        description="PyCharm is an integrated development environment (IDE) used in computer programming, specifically for the Python language. It is developed by the Czech company JetBrains.",
        url="jetbrains.com/pycharm",
        company=await Company.objects.acreate(
            name="JetBrains",
            domain="jetbrains.com",
            country="NL",
            ownership=await create_company_ownership("Private"),
        ),
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
    review = await ToolReview.objects.acreate(
        tool=pycharm,
        author=user,
        title="Fine, haven't seen better for Python or Django",
        content_pros=textwrap.dedent(
            """
            - Better than VS Code for Python
            - Python/Django stubs and completions
            - Debugger
            - Git UI and shortcuts
            """
        ),
        content_cons=textwrap.dedent(
            """
            - JS/TS integration performance has been improving, but still not as good as VS Code
            - Bugs are frequent. Less than in VS Code, but still a lot
            """
        ),
        usage_status=UsageStatus.USING,
        rating=67,
        importance=83,
        experience_hours=17_000,
        reviewed_at=timezone.now() - datetime.timedelta(days=8, hours=5, minutes=30),
    )
    await create_review_tags(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(ReviewTagName.value, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.a_must, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.ease_of_use, is_vote_pos=False),
        ],
    )
    await gen.comments.create(review=review, author=user)


async def _create_review_iterm(user: User):
    tool = await Tool.objects.acreate(
        name="iTerm2",
        type="Program",
        crunchbase_url="crunchbase.com/organization/iterm2",
        github_url="github.com/gnachman/iTerm2",
        description="iTerm2 is a terminal emulator for macOS that does amazing things. It brings the terminal into the modern age with features you never knew you always wanted.",
        company=await Company.objects.acreate(
            name="iTerm2",
            domain="iterm2.com",
            country="US",
            is_single_product=True,
            ownership=await create_company_ownership("Private"),
        ),
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

    review = await ToolReview.objects.acreate(
        tool=tool,
        author=user,
        title="Good shortcuts and render config, actively maintained",
        content=textwrap.dedent(
            """
            - Fast native render (Objective-C/Swift)
            - no extra features, like history/fish/llm/etc
            """
        ),
        usage_status=UsageStatus.USING,
        rating=75,
        importance=51,
        experience_hours=7_000,
    )
    await create_review_tags(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.open_source, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.stability, is_vote_pos=True),
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=False),
        ],
    )

    return tool


async def _create_review_ghostly(user: User, alternatives: list[Tool] = None):
    tool = await Tool.objects.acreate(
        name="Ghostty",
        type="Program",
        github_url="github.com/ghostty-org/ghostty",
        description="Ghostty is a terminal emulator that differentiates itself by being fast, feature-rich, and native.Performance is a category where people start getting really argumentative, so the only claim I make is that Ghostty aims to be in the same class as the fastest terminal emulators",
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

    review = await ToolReview.objects.acreate(
        tool=tool,
        author=user,
        title="Haven't tried, heard good things from HN - embeddable, Zig-based",
        usage_status=UsageStatus.INTERESTED,
        reviewed_at=timezone.now() - datetime.timedelta(days=35),
    )
    await create_review_tags(
        review=review,
        params=[
            ReviewTagParams(ReviewTagName.expectations, is_vote_pos=True),
        ],
    )


async def create_company_ownership(name: str) -> CompanyOwnership:
    ownership, _ = await CompanyOwnership.objects.aget_or_create(name=name)
    return ownership


@dataclasses.dataclass
class TagParams:
    name: str
    is_vote_pos: bool | None = None
    is_important: bool = False


async def create_tags(tool: Tool, author: User, params: list[TagParams]):
    await asyncio.gather(
        *[
            create_tag(
                name_raw=param.name,
                tool=tool,
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


async def create_review_tags(review: ToolReview, params: list[ReviewTagParams]):
    await asyncio.gather(
        *[
            ToolReviewTag.objects.acreate(
                review=review,
                name=param.name.value,
                is_vote_positive=param.is_vote_pos,
            )
            for param in params
        ]
    )
