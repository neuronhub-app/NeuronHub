import strawberry
from strawberry import Info
from django.conf import settings

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate


@strawberry.type
class TestsMutation:
    @strawberry.mutation()
    async def test_db_stubs_repopulate(
        self,
        info: Info,
        is_import_HN_post: bool | None = True,
        is_create_single_review: bool | None = False,
    ) -> str:
        assert settings.DEBUG

        gen = await db_stubs_repopulate(
            is_delete_posts=True,
            is_delete_user_default=True,
            is_delete_users_extra=True,
            is_import_HN_post=is_import_HN_post,
            is_create_single_review=is_create_single_review,
        )
        return gen.users.user_default.username
