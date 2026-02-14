from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import
from neuronhub.apps.profiles.services.csv_import_optimized import (
    get_top_llm_scored_unreviewed_profiles,
)
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_llm_scoring
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_user_review
from neuronhub.apps.tests.test_cases import NeuronTestCase


class config:
    limit = 100


class CsvImportOptimizedTest(NeuronTestCase):
    async def test_first_row_is_not_header(self):
        stats = await _csv_save_to_db(limit=2)
        assert stats.created
        assert not await Profile.objects.filter(first_name="First Name").aexists()

    async def test_sync_is_idempotent(self):
        stats = await _csv_save_to_db()

        assert stats.created == config.limit
        assert stats.created == await Profile.objects.acount()
        # DB-normalized: country "United States" → "US" (# keep item)
        assert await Profile.objects.filter(country="US").aexists()
        assert not await Profile.objects.filter(country="United States").aexists()

        stats_unchanged = await _csv_save_to_db()
        assert stats_unchanged.created == 0
        assert stats_unchanged.updated == 0
        assert stats_unchanged.unchanged == config.limit

    async def test_skills_are_posttags_under_skill_parent(self):
        await _csv_save_to_db(limit=10)

        skill_parent = await PostTag.objects.aget(name="Skill", tag_parent=None)
        skill_tags = await sync_to_async(list)(PostTag.objects.filter(tag_parent=skill_parent))
        assert len(skill_tags) > 0

        profile_with_skills = await sync_to_async(
            lambda: Profile.objects.prefetch_related("skills")
            .filter(skills__isnull=False)
            .first()
        )()
        assert profile_with_skills is not None
        skills = await sync_to_async(profile_with_skills.get_tag_skills_names)()
        assert len(skills) > 0
        for skill in skills:
            assert await PostTag.objects.filter(name=skill, tag_parent=skill_parent).aexists()


# AI
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


async def _csv_save_to_db(limit: int = config.limit):
    return await sync_to_async(csv_optimize_and_import)(
        settings.CONF_CONFIG.eag_csv_path,  # type: ignore[has-type]
        limit=limit,
    )
