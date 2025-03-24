import logging
import textwrap

from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.tools.models import Company
from neuronhub.apps.tools.models import CompanyOwnership
from neuronhub.apps.tools.models import Importance
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolAlternative
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolStatsGithub
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.tools.models import UsageStatus
from neuronhub.apps.tools.services.create_tag import Vote
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
        await ToolStatsGithub.objects.all().adelete()
        await ToolReview.objects.all().adelete()
        await Tool.objects.all().adelete()

    if is_delete_orgs:
        # todo[+](test) restore orgs
        await Org.objects.all().adelete()

    if is_delete_users:
        await User.objects.all().adelete()

    gen = await Gen.create()
    user = await gen.users.get_user_default()

    await _create_review_pycharm(user)
    await _create_review_iterm(user)


async def _create_review_pycharm(user: User):
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

    vote = Vote(is_pos=True, tool=pycharm)
    await create_tag("Dev / IDE", author=user, vote=vote)
    await create_tag("Dev / Python", author=user, vote=vote)
    await create_tag("Dev / Kotlin", author=user, vote=vote)
    await create_tag("Dev / TypeScript", author=user, vote=vote)
    await create_tag("Dev / Database", author=user, vote=vote)
    await create_tag("Dev / Django", author=user, vote=vote)
    await create_tag("Dev / Web Development", author=user, vote=vote)
    await create_tag("Dev / JavaScript", author=user)
    await create_tag("Dev / JetBrains", author=user)
    await create_tag("Dev / Java", author=user)
    await create_tag("Dev / Open Source Core", author=user, vote=vote)

    await create_tag("Business / Subscription", author=user, vote=vote)
    await create_tag("Business / Paid", author=user, vote=vote)
    await create_tag("Business / Free Trial", author=user, vote=vote)

    await ToolReview.objects.acreate(
        tool=pycharm,
        author=user,
        title="Fine, haven't found a better one",
        content=textwrap.dedent(
            """
            Pros
            - Better than VS Code for Python
            - Python/Django stubs and completions
            - Debugger
            - Git UI and shortcuts
            
            Cons
            - JS/TS integration performance has been improving, but still not as good as VS Code
            - Bugs are frequent. Less than in VS Code, but still a lot

            No alternatives for Python.
            """
        ),
        usage_status=UsageStatus.USING,
        rating=73,
        importance=Importance.EXTRA_HIGH,
    )


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

    vote = Vote(is_pos=True, tool=tool)
    await create_tag("Dev / Terminal", author=user, vote=vote)
    await create_tag("Dev / Linux", author=user, vote=vote)
    await create_tag("Dev / License / GPL v2", author=user, vote=vote)
    await create_tag("Dev / CLI")
    await create_tag("Dev / Shell")
    await create_tag("Dev / macOS")

    await ToolReview.objects.acreate(
        tool=tool,
        author=user,
        title="Good shortcuts and render config, actively maintained",
        content=textwrap.dedent(
            """
            Pros
            - Simple config
            - Performant native render (Objective-C/Swift)
            
            Cons
            - not much extra features besides default terminal, eg no extra fish/ai/etc support
            """
        ),
        usage_status=UsageStatus.USING,
        rating=75,
        importance=Importance.HIGH,
    )


async def create_company_ownership(name: str) -> CompanyOwnership:
    ownership, _ = await CompanyOwnership.objects.aget_or_create(name=name)
    return ownership
