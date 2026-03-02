from django.utils import timezone
from django_tasks.backends.database.models import DBTaskResult
from django_tasks.base import TaskResultStatus

from neuronhub.apps.profiles.graphql import SCORE_PROFILES_TASK
from neuronhub.apps.profiles.graphql import _check_failed_task
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI
class ProfileMatchGraphqlTest(NeuronTestCase):
    async def test_trigger_total_capped_by_available(self):
        await self.gen.profiles.profile(user=self.user)
        await self.gen.profiles.profile(user=None)
        await self.gen.profiles.profile(user=None)

        result = await self.graphql_query(
            """
              mutation {
                  profile_matches_trigger_llm(limit: 999, model: "haiku", is_dry: true) {
                      total
                      is_processing model
                  }
              }
            """
        )

        assert result.errors is None
        data = result.data["profile_matches_trigger_llm"]
        assert data["total"] == 3
        assert data["is_processing"]

    async def test_returns_error_on_failed_task(self):
        traceback = "Traceback: something broke"
        await _create_task_result(
            status=TaskResultStatus.FAILED,
            traceback=traceback,
            exception_class_path="builtins.RuntimeError",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error == traceback

    async def test_returns_no_error_when_no_tasks(self):
        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error is None
        assert result.total == 0

    async def test_returns_no_error_when_latest_task_succeeded(self):
        await _create_task_result(status=TaskResultStatus.SUCCEEDED, user_id=self.user.id)

        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error is None

    # unclear why. and why it matters
    async def test_returns_fallback_error_when_no_traceback(self):
        await _create_task_result(
            status=TaskResultStatus.FAILED,
            traceback="",
            exception_class_path="builtins.RuntimeError",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error == "Task failed: builtins.RuntimeError"

    async def test_does_not_see_other_users_failed_task(self):
        user_other = await self.gen.users.user()
        await _create_task_result(
            status=TaskResultStatus.FAILED,
            traceback="Other user's error",
            user_id=user_other.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error is None
        assert result.total == 0

    async def test_cancelled_task_not_shown_as_error(self):
        """Cancel sets status=FAILED but no traceback/exception — should not show error."""
        await _create_task_result(
            status=TaskResultStatus.FAILED,
            traceback="",
            exception_class_path="",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error is None
        assert result.is_processing is False


# #AI
async def _create_task_result(
    status: TaskResultStatus = TaskResultStatus.READY,
    traceback: str = "",
    exception_class_path: str = "",
    user_id: int = 0,
    **kwargs,
) -> DBTaskResult:
    defaults = {
        "task_path": SCORE_PROFILES_TASK,
        "status": status,
        "args_kwargs": {
            "args": [],
            "kwargs": {"limit": 100, "model": "haiku", "user_id": user_id},
        },
        "backend_name": "default",
        "run_after": timezone.now(),
        "traceback": traceback,
        "exception_class_path": exception_class_path,
    }
    defaults.update(kwargs)
    return await DBTaskResult.objects.acreate(**defaults)
