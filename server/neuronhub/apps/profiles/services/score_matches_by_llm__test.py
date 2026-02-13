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
            seeks="Want to meet SWE people",
            offers="Nonprofit infra help and consulting",
        )
        limit = 3
        config = MatchConfig(
            user=self.user,
            user_profile=profile.profile_for_llm_md,
            batch_size=limit,
            dry_run=True,
            use_calibration=False,
        )

        profiles = await sync_to_async(list)(Profile.objects.all()[:limit])
        match_result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert len(match_result.scores) == limit
        for profile in profiles:
            assert f'id="{profile.id}"' in match_result.prompt

    async def test_batch_scoring(self):
        await _csv_optimize_and_import()

        limit = 3
        profile = await self.gen.profiles.profile(
            user=self.user,
            job_title="SWE",
            seeks="Want to meet SWE people",
            offers="Nonprofit infra help and consulting",
        )
        config = MatchConfig(
            user=self.user,
            user_profile=profile.profile_for_llm_md,
            batch_size=limit,
            model="claude-3-haiku-20240307",  # cheapest
        )

        profiles = await sync_to_async(list)(Profile.objects.all()[:limit])
        match_result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert len(match_result.scores) == limit

    async def test_calibration_injected_into_prompt(self):
        await _csv_optimize_and_import()
        alice = await Profile.objects.afirst()
        assert alice is not None
        await gen_llm_scoring(alice, self.user, score_by_llm=80)
        await gen_user_review(alice, self.user, score_by_user=60, review_note="too AIS")

        config = MatchConfig(
            user=self.user,
            user_profile=textwrap.dedent(
                """
                I need your to help with picking who to meet and why at an upcoming conference.

                My interests:
                - Nonprofit infra help

                My expertise:
                - SWE
                - Nonprofit infra
                """
            ),
            batch_size=3,
            dry_run=True,
            use_calibration=True,
        )
        profiles = [alice] + await sync_to_async(list)(Profile.objects.exclude(id=alice.id)[:2])
        result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert "<Calibration_Examples>" in result.prompt
        assert "too AIS" in result.prompt


async def _csv_optimize_and_import():
    await sync_to_async(csv_optimize_and_import)(
        settings.CONF_CONFIG.eag_csv_path  # type: ignore[has-type]
    )
