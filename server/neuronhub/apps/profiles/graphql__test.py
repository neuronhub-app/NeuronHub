from datetime import timedelta

from asgiref.sync import sync_to_async
from django.utils import timezone
from django_tasks.backends.database.models import DBTaskResult
from django_tasks.base import TaskResultStatus

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.profiles.graphql import SCORE_PROFILES_TASK
from neuronhub.apps.profiles.graphql import _check_failed_task
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI
class ProfileModelTest(NeuronTestCase):
    @staticmethod
    async def _get_profile_with_match(pk: int) -> Profile:
        return await Profile.objects.select_related("match").aget(pk=pk)

    async def test_needs_reprocessing_when_content_updated(self):
        profile = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        user = await self.gen.users.user()

        old_time = timezone.now() - timezone.timedelta(hours=1)
        await ProfileMatch.objects.acreate(
            user=user,
            profile=profile,
            match_score_by_llm=75,
            match_processed_at=old_time,
        )

        profile.biography = "Updated biography"
        await profile.asave()

        profile = await self._get_profile_with_match(profile.pk)
        assert await sync_to_async(profile.is_needs_llm_reprocessing)() is True

    async def test_no_reprocessing_when_match_is_fresh(self):
        profile = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        user = await self.gen.users.user()

        await ProfileMatch.objects.acreate(
            user=user,
            profile=profile,
            match_score_by_llm=75,
            match_processed_at=timezone.now(),
        )

        profile = await self._get_profile_with_match(profile.pk)
        assert await sync_to_async(profile.is_needs_llm_reprocessing)() is False


# #AI
class ProfileMatchStatsQueryTest(NeuronTestCase):
    async def test_profile_match_stats_returns_counts(self):
        p1 = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        p2 = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        p3 = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        p4 = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)

        fresh_time = timezone.now() + timedelta(seconds=1)
        # p1: LLM scored, processed
        m1 = await self.gen.profiles.match(profile=p1, score_by_llm=70)
        m1.match_processed_at = fresh_time
        await m1.asave()
        # p2: LLM scored + user rated, processed
        m2 = await self.gen.profiles.match(profile=p2, score_by_llm=80, score_by_user=60)
        m2.match_processed_at = fresh_time
        await m2.asave()
        # p3: match exists but never processed (no match_processed_at)
        await self.gen.profiles.match(profile=p3)
        # p4: no match at all

        result = await self.graphql_query("""
            query { profile_match_stats {
                rated_count llm_scored_count
                unprocessed_count needs_reprocessing_count
            } }
        """)

        assert result.errors is None
        stats = result.data["profile_match_stats"]
        assert stats["llm_scored_count"] == 2
        assert stats["rated_count"] == 1
        assert stats["unprocessed_count"] == 2  # p3 (no match_processed_at) + p4 (no match)
        assert stats["needs_reprocessing_count"] == 0

    async def test_profile_match_stats_empty(self):
        result = await self.graphql_query("""
            query { profile_match_stats {
                rated_count llm_scored_count
                unprocessed_count needs_reprocessing_count
            } }
        """)

        assert result.errors is None
        stats = result.data["profile_match_stats"]
        assert stats["llm_scored_count"] == 0
        assert stats["rated_count"] == 0
        assert stats["unprocessed_count"] == 0
        assert stats["needs_reprocessing_count"] == 0


# #AI
class ProfileTriggerLlmLimitTest(NeuronTestCase):
    async def test_haiku_limit_clamped_to_400(self):
        from neuronhub.apps.profiles.graphql import MODEL_LIMITS

        assert MODEL_LIMITS["haiku"]["max"] == 400
        assert MODEL_LIMITS["haiku"]["default"] == 200

    async def test_sonnet_limit_clamped_to_80(self):
        from neuronhub.apps.profiles.graphql import MODEL_LIMITS

        assert MODEL_LIMITS["sonnet"]["max"] == 80
        assert MODEL_LIMITS["sonnet"]["default"] == 40


# #AI
def _create_task_result(
    *,
    status=TaskResultStatus.READY,
    traceback="",
    exception_class_path="",
    user_id: int = 0,
    **kwargs,
):
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
    return DBTaskResult.objects.create(**defaults)


# #AI
class CheckFailedTaskTest(NeuronTestCase):
    async def test_returns_error_on_failed_task(self):
        await sync_to_async(_create_task_result)(
            status=TaskResultStatus.FAILED,
            traceback="Traceback: something broke",
            exception_class_path="builtins.RuntimeError",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error == "Traceback: something broke"
        assert result.total == 100
        assert result.model == "haiku"

    async def test_returns_no_error_when_no_tasks(self):
        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error is None
        assert result.total == 0

    async def test_returns_no_error_when_latest_task_succeeded(self):
        await sync_to_async(_create_task_result)(
            status=TaskResultStatus.SUCCEEDED,
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.is_processing is False
        assert result.error is None

    async def test_returns_fallback_error_when_no_traceback(self):
        await sync_to_async(_create_task_result)(
            status=TaskResultStatus.FAILED,
            traceback="",
            exception_class_path="builtins.RuntimeError",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error == "Task failed: builtins.RuntimeError"

    async def test_does_not_see_other_users_failed_task(self):
        other_user = await self.gen.users.user()
        await sync_to_async(_create_task_result)(
            status=TaskResultStatus.FAILED,
            traceback="Other user's error",
            user_id=other_user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error is None
        assert result.total == 0

    async def test_cancelled_task_not_shown_as_error(self):
        """Cancel sets status=FAILED but no traceback/exception — should not show error."""
        await sync_to_async(_create_task_result)(
            status=TaskResultStatus.FAILED,
            traceback="",
            exception_class_path="",
            user_id=self.user.id,
        )

        result = await _check_failed_task(self.user)
        assert result.error is None
        assert result.is_processing is False
