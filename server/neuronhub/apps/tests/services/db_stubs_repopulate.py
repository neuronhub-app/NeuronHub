import logging

from neuronhub.apps.algolia.services.algolia_reindex import AlgoliaModel
from neuronhub.apps.algolia.services.algolia_reindex import algolia_reindex
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.tests.db_stubs import create_jobs_stubs
from neuronhub.apps.posts.tests.db_stubs import create_posts_stubs
from neuronhub.apps.posts.tests.db_stubs import users
from neuronhub.apps.profiles.tests.db_stubs import create_profiles_stubs
from neuronhub.apps.tests.services.test_gen_reset import test_gen_reset
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.models import UserConnectionGroup


logger = logging.getLogger(__name__)


async def db_stubs_repopulate(is_create_single_review=False, is_import_HN_post=True) -> Gen:
    await test_gen_reset()

    with disable_auto_indexing_if_enabled():
        gen = await Gen.create(is_user_default_superuser=True)

        await _create_users(gen)

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


async def _create_users(gen: Gen):
    user = gen.users.user_default

    await gen.users.alias(user, is_get_or_create=True)
    await gen.users.alias(user, is_get_or_create=True)

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
