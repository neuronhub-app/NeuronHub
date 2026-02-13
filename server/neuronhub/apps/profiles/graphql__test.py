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

    async def test_profile_llm_md_reset_restores_auto_generation(self):
        user = await self.gen.users.user()
        profile = await self.gen.profiles.profile(user=user)

        # Set custom profile
        profile.is_profile_custom = True
        profile.profile_for_llm_md = "Custom markdown content"
        await profile.asave()

        assert profile.is_profile_custom is True
        custom_md = profile.profile_for_llm_md

        # Reset to auto-generation
        mutation = """
            mutation {
                profile_llm_md_reset
            }
        """
        result = await self.graphql_query(mutation, user_authed=user)
        assert result.errors is None

        # Verify auto-generation is restored
        profile = await Profile.objects.aget(pk=profile.pk)
        assert profile.is_profile_custom is False
        assert profile.profile_for_llm_md != custom_md
