from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.serialize_to_md import serialize_profile_to_markdown
from neuronhub.apps.tests.test_cases import NeuronTestCase


class SerializeToMdTest(NeuronTestCase):
    async def test_optimization_applied_to_text_fields(self):
        """Verify csv_optimize_tokens is applied when serializing for LLM"""
        profile = await self.gen.profiles.profile(
            user=self.user,
            first_name="John",
            last_name="Doe",
            company="The Centre for Effective Altruism",
            job_title="Software development/Software engineering",
            biography="I work at Open Philanthropy in San Francisco.",
        )

        # profile_for_llm_md is automatically populated on save via serialize_profile_to_markdown
        result = profile.profile_for_llm_md

        # Optimized values should appear in the serialized output
        assert "SWE" in result  # "Software development/Software engineering" -> "SWE"
        assert "OpenPhil" in result  # "Open Philanthropy" -> "OpenPhil"
        assert "SF" in result  # "San Francisco" -> "SF"

        # Original long forms should NOT appear
        assert "Software development/Software engineering" not in result
        assert "Open Philanthropy" not in result
        assert "San Francisco" not in result

    async def test_raw_data_stored_in_db(self):
        """LLM-only items stay raw in DB; gen.profiles doesn't run csv_normalize_for_db"""
        profile = await self.gen.profiles.profile(
            user=self.user,
            company="The Centre for Animals",
            biography="I work in San Francisco.",
        )
        profile = await Profile.objects.aget(id=profile.id)
        assert "San Francisco" in profile.biography
