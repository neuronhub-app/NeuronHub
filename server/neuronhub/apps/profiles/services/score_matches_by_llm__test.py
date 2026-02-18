import textwrap

import pytest
from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import
from neuronhub.apps.profiles.services.score_matches_by_llm import MatchConfig
from neuronhub.apps.profiles.services.score_matches_by_llm import _score_matches_batch_by_llm
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_llm_scoring
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_user_review
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI-slop
@pytest.mark.slow
@pytest.mark.slow_llm_api
class ScoreMatchesByLlmTest(NeuronTestCase):
    async def test_batch_prompt_contains_attendees_dry_run(self):
        await _csv_optimize_and_import()

        profile = await self.gen.profiles.profile(
            user=self.user,
            job_title="SWE",
            offers="Nonprofit infra",
        )
        limit = 3

        profiles = await sync_to_async(list)(Profile.objects.all()[:limit])
        match_result = await sync_to_async(_score_matches_batch_by_llm)(
            profiles,
            config=MatchConfig(
                user=self.user,
                user_profile=profile.profile_for_llm_md,
                batch_size=limit,
                is_dry_run=True,
                is_use_calibration=False,
                is_logs_enabled=False,
            ),
        )

        assert len(match_result.scores) == limit
        for profile in profiles:
            assert f'id="{profile.id}"' in match_result.prompt

    async def test_batch_scoring(self):
        await _csv_optimize_and_import(limit=4)

        limit = 3
        profile = await self.gen.profiles.profile(
            user=self.user,
            job_title="SWE",
            offers="Nonprofit infra",
        )
        config = MatchConfig(
            user=self.user,
            user_profile=profile.profile_for_llm_md,
            batch_size=limit,
            model="claude-3-haiku-20240307",  # cheapest
            is_logs_enabled=False,
        )

        profiles = await sync_to_async(list)(Profile.objects.all()[:limit])
        match_result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert len(match_result.scores) == limit

    async def test_calibration_injected_into_prompt(self):
        await _csv_optimize_and_import(limit=4)
        profile_1 = await Profile.objects.afirst()
        await gen_llm_scoring(profile_1, self.user, score_by_llm=80)
        review_note = "not a fit re seeks/offers"
        await gen_user_review(profile_1, self.user, score_by_user=60, review_note=review_note)

        config = MatchConfig(
            user=self.user,
            user_profile=textwrap.dedent(
                """
                My interests:
                - Nonprofit infra help

                My expertise:
                - SWE
                """
            ),
            batch_size=3,
            is_dry_run=True,
            is_use_calibration=True,
            is_logs_enabled=False,
        )
        profiles = [profile_1] + await sync_to_async(list)(
            Profile.objects.exclude(id=profile_1.id)[:2]
        )
        result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert config.calibration_xml_tag in result.prompt
        assert review_note in result.prompt


async def _csv_optimize_and_import(limit: int = 4):
    await sync_to_async(csv_optimize_and_import)(
        csv_path=settings.CONF_CONFIG.eag_csv_path,  # type: ignore[has-type]
        limit=limit,
    )
