from django_tasks_db.models import DBTaskResult

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobsLandingPage
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.tools import ToolCompanyOwnership
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.tests.services.algolia_clear_indices import algolia_clear_indices
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup
from neuronhub.apps.users.tests.test_gen import UsersGen


async def db_reset_and_algolia_clear() -> None:
    with disable_auto_indexing_if_enabled():
        for model in _models_to_drop_ordered:
            await model.objects.all().adelete()  # type: ignore[attr-defined] #bad-infer

        await algolia_clear_indices()

        await User.objects.exclude(username=UsersGen._user_username).adelete()
        await UsersGen.get_or_create_user_default(is_superuser=True)


# todo !! fix: enforce extension on creation of a new model - eg by a runtime check in dev.
_models_to_drop_ordered = [
    PostHighlight,
    PostRelated,
    PostTagVote,
    PostTag,
    PostVote,
    Post,
    PostSource,
    UserSource,
    ToolCompany,
    ToolCompanyOwnership,
    ProfileMatch,
    ProfileInvite,
    Profile,
    ProfileGroup,
    JobAlert,
    JobsLandingPage,
    Job,
    Org,
    UserConnectionGroup,
    DBTaskResult,
]
