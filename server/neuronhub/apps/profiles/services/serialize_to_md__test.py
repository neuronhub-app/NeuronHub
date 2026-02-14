from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.tests.test_cases import NeuronTestCase


class SerializeToMdTest(NeuronTestCase):
    async def test_optimization_applied_to_text_fields(self):
        profile = await self.gen.profiles.profile(
            user=self.user,
            first_name="John",
            last_name="Doe",
            company="The Centre for Effective Altruism",
            job_title="Software development/Software engineering",
            biography="I work at Open Philanthropy in San Francisco.",
        )
        assert "SWE" in profile.profile_for_llm_md
        assert "SF" in profile.profile_for_llm_md

        # Original long forms should NOT appear
        assert "Open Philanthropy" not in profile.profile_for_llm_md
        assert "San Francisco" not in profile.profile_for_llm_md

    async def test_raw_data_stored_in_db(self):
        profile = await self.gen.profiles.profile(
            user=self.user,
            biography="I work in San Francisco.",
        )
        profile = await Profile.objects.aget(id=profile.id)
        assert "San Francisco" in profile.biography
