import logging

from neuronhub.apps.algolia.services.algolia_reindex import AlgoliaModel
from neuronhub.apps.algolia.services.algolia_reindex import algolia_reindex
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.tests.db_stubs import create_jobs_stubs
from neuronhub.apps.posts.tests.db_stubs import create_posts_stubs
from neuronhub.apps.profiles.tests.db_stubs import create_profiles_stubs
from neuronhub.apps.tests.services.db_reset_and_partial_reindex import (
    db_reset_and_partial_reindex,
)
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.tests.db_stubs import create_users_stubs


logger = logging.getLogger(__name__)


async def db_stubs_repopulate(is_create_single_review=False, is_import_HN_post=True) -> Gen:
    await db_reset_and_partial_reindex()

    with disable_auto_indexing_if_enabled():
        gen = await Gen.create(is_user_default_superuser=True)

        await create_users_stubs(gen)

        await create_posts_stubs(
            gen,
            is_create_single_review=is_create_single_review,
            is_import_HN_post=is_import_HN_post,
        )

        await create_profiles_stubs(gen)

        await create_jobs_stubs(gen)

    # todo ! fix: simply call eg the default reindex of all registered models
    await algolia_reindex([AlgoliaModel.Post, AlgoliaModel.Profile, AlgoliaModel.Job])

    return gen
