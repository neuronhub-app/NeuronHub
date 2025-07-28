import strawberry
from strawberry import Info
from django.conf import settings

from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate


@strawberry.type
class TestsMutation:
    @strawberry.mutation()
    async def test_db_stubs_repopulate(self, info: Info) -> str:
        assert settings.DEBUG

        gen = await db_stubs_repopulate(is_delete_posts=True, is_delete_users=True)
        return gen.users.user_default.username
