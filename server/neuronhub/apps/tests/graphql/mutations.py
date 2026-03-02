import strawberry
from django.conf import settings
from django.utils import timezone

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate
from neuronhub.settings import DjangoEnv


@strawberry.type
class TestsMutation:
    @strawberry.mutation()
    async def test_db_stubs_repopulate(
        self,
        info: strawberry.Info,
        is_import_HN_post: bool | None = True,
        is_create_single_review: bool | None = False,
        is_create_profiles: bool | None = False,
        is_create_jobs: bool | None = False,
    ) -> str:
        assert settings.DEBUG
        assert settings.DJANGO_ENV is DjangoEnv.DEV_TEST_E2E

        gen = await db_stubs_repopulate(
            is_delete_posts=True,
            is_delete_posts_extra=True,
            is_delete_user_default=True,
            is_delete_users_extra=True,
            is_import_HN_post=is_import_HN_post,
            is_create_single_review=is_create_single_review,
            is_create_profiles=is_create_profiles,
            is_create_jobs=is_create_jobs,
        )
        return gen.users.user_default.username

    # #AI
    @strawberry.mutation()
    async def test_create_failed_task(self, info: strawberry.Info) -> bool:
        from django.contrib.auth import get_user_model
        from django_tasks.backends.database.models import DBTaskResult
        from django_tasks.base import TaskResultStatus

        from neuronhub.apps.profiles.graphql import SCORE_PROFILES_TASK

        assert settings.DEBUG
        assert settings.DJANGO_ENV is DjangoEnv.DEV_TEST_E2E

        User = get_user_model()
        user = await User.objects.aget(username="admin")
        await DBTaskResult.objects.acreate(
            task_path=SCORE_PROFILES_TASK,
            status=TaskResultStatus.FAILED,
            args_kwargs={
                "args": [],
                "kwargs": {"limit": 10, "model": "haiku", "user_id": user.id},
            },
            backend_name="default",
            run_after=timezone.now(),
            traceback="RuntimeError: db_worker is not running",
        )
        return True
