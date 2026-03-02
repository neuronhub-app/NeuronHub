from asgiref.sync import sync_to_async

from neuronhub.apps.profiles.services.csv_import_optimized import (
    get_top_llm_scored_unreviewed_profiles,
)
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_llm_scoring
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_user_review
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI
class GetTopLlmScoredUnreviewedProfilesTest(NeuronTestCase):
    async def test_returns_only_llm_scored_not_user_reviewed(self):
        p_scored_high = await self.gen.profiles.profile(first_name="High")
        p_scored_low = await self.gen.profiles.profile(first_name="Low")
        p_reviewed = await self.gen.profiles.profile(first_name="Reviewed")
        await self.gen.profiles.profile(first_name="Unscored")

        await gen_llm_scoring(p_scored_high, self.user, score_by_llm=90)
        await gen_llm_scoring(p_scored_low, self.user, score_by_llm=40)
        await gen_llm_scoring(p_reviewed, self.user, score_by_llm=85)
        await gen_user_review(p_reviewed, self.user, score_by_user=70)

        result = await sync_to_async(list)(get_top_llm_scored_unreviewed_profiles(self.user))

        names = [p.first_name for p in result]
        assert "High" in names
        assert "Low" in names
        assert "Reviewed" not in names, "User-reviewed profiles should be excluded"
        assert "Unscored" not in names, "Unscored profiles should be excluded"

    async def test_ordered_by_llm_score_descending(self):
        p1 = await self.gen.profiles.profile(first_name="Mid")
        p2 = await self.gen.profiles.profile(first_name="Top")
        p3 = await self.gen.profiles.profile(first_name="Bottom")

        await gen_llm_scoring(p1, self.user, score_by_llm=60)
        await gen_llm_scoring(p2, self.user, score_by_llm=95)
        await gen_llm_scoring(p3, self.user, score_by_llm=30)

        result = await sync_to_async(list)(get_top_llm_scored_unreviewed_profiles(self.user))

        names = [p.first_name for p in result]
        assert names == ["Top", "Mid", "Bottom"]
