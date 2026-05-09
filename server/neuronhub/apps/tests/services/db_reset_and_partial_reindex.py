from django.conf import settings
from django.db.models import Model
from django_tasks.backends.database.models import DBTaskResult

from neuronhub.apps.algolia.services.algolia_reindex_partial import AlgoliaChangedIds
from neuronhub.apps.algolia.services.algolia_reindex_partial import algolia_reindex_partial
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
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
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup
from neuronhub.apps.users.tests.test_gen import UsersGen


async def db_reset_and_partial_reindex() -> None:
    with disable_auto_indexing_if_enabled():
        algolia_ids: list[AlgoliaChangedIds] = []
        for model in _models_to_drop_ordered:
            if ids := await _get_algolia_ids_to_delete(model):
                algolia_ids.append(ids)

            await model.objects.all().adelete()  # type: ignore[attr-defined] #bad-infer

        await algolia_reindex_partial(*algolia_ids)

        await User.objects.exclude(username=UsersGen._user_username).adelete()
        await UsersGen.get_or_create_user_default(is_superuser=True)


async def _get_algolia_ids_to_delete(model: type[Model]) -> AlgoliaChangedIds | None:
    if not settings.ALGOLIA["IS_ENABLED"]:
        return None

    from algoliasearch_django import AlgoliaIndex
    from algoliasearch_django import algolia_engine

    if model in algolia_engine.get_registered_models():
        adapter: AlgoliaIndex = algolia_engine.get_adapter(model)
        return AlgoliaChangedIds(
            model=model,
            deleted=[
                id
                async for id in model.objects.all().values_list(  # type: ignore[attr-defined] #bad-infer
                    adapter.custom_objectID,
                    flat=True,
                )
            ],
            is_custom_objectIDs=True,
        )

    return None


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
    Job,
    Org,
    UserConnectionGroup,
    DBTaskResult,
]
