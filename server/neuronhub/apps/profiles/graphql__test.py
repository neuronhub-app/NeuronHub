from asgiref.sync import sync_to_async
from django.utils import timezone

from neuronhub.apps.anonymizer.fields import Visibility
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

        # p1: LLM scored only
        await self.gen.profiles.match(profile=p1, score_by_llm=70)
        # p2: LLM scored + user rated
        await self.gen.profiles.match(profile=p2, score_by_llm=80, score_by_user=60)
        # p3: no scores
        await self.gen.profiles.match(profile=p3)

        result = await self.graphql_query("""
            query { profile_match_stats { rated_count llm_scored_count } }
        """)

        assert result.errors is None
        stats = result.data["profile_match_stats"]
        assert stats["llm_scored_count"] == 2
        assert stats["rated_count"] == 1

    async def test_profile_match_stats_empty(self):
        result = await self.graphql_query("""
            query { profile_match_stats { rated_count llm_scored_count } }
        """)

        assert result.errors is None
        stats = result.data["profile_match_stats"]
        assert stats["llm_scored_count"] == 0
        assert stats["rated_count"] == 0


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
