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
