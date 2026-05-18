import strawberry
from django.conf import settings
from django.utils import timezone

from neuronhub.apps.tests.services.reset_db_and_gen import GenCreateParams
from neuronhub.apps.tests.services.reset_db_and_gen import reset_db_and_gen
from neuronhub.settings import DjangoEnv


@strawberry.type
class TestsMutation:
    @strawberry.mutation
    async def reset_db_and_gen(
        self,
        info: strawberry.Info,
        create_params: list[GenCreateParams] = [],  # noqa: B006 Strawberry assigns from GraphQL input
    ) -> bool:
        assert settings.DJANGO_ENV is DjangoEnv.DEV_TEST_E2E
        await reset_db_and_gen(create_params)
        return True

    # #AI
    @strawberry.mutation
    async def test_create_failed_task(self, info: strawberry.Info) -> bool:
        from django.contrib.auth import get_user_model
        from django_tasks_db.models import DBTaskResult
        from django_tasks.base import TaskResultStatus

        from neuronhub.apps.profiles.graphql import SCORE_PROFILES_TASK

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
