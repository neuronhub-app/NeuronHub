import textwrap

import pytest
from asgiref.sync import sync_to_async

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.score_matches_by_llm import MatchConfig
from neuronhub.apps.profiles.services.score_matches_by_llm import _score_matches_batch_by_llm
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_llm_scoring
from neuronhub.apps.profiles.services.summarize_match_reviews__test import gen_user_review
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI-slop
@pytest.mark.slow
@pytest.mark.slow_llm_api
class ScoreMatchesByLlmTest(NeuronTestCase):
    async def _create_profiles(self, count: int) -> list[Profile]:
        return [await self.gen.profiles.profile() for _ in range(count)]

    async def test_batch_prompt_contains_attendees_dry_run(self):
        profiles = await self._create_profiles(3)

        user_profile = await self.gen.profiles.profile(
            user=self.user,
            job_title="SWE",
            offers="Nonprofit infra",
        )

        match_result = await sync_to_async(_score_matches_batch_by_llm)(
            profiles,
            config=MatchConfig(
                user=self.user,
                user_profile=user_profile.profile_for_llm_md,
                batch_size=3,
                is_dry_run=True,
                is_use_calibration=False,
                is_logs_enabled=False,
            ),
        )

        assert len(match_result.scores) == 3
        for profile in profiles:
            assert f'id="{profile.id}"' in match_result.prompt

    async def test_batch_scoring(self):
        profiles = await self._create_profiles(3)

        user_profile = await self.gen.profiles.profile(
            user=self.user,
            job_title="SWE",
            offers="Nonprofit infra",
        )
        config = MatchConfig(
            user=self.user,
            user_profile=user_profile.profile_for_llm_md,
            batch_size=3,
            model="claude-3-haiku-20240307",  # cheapest
            is_logs_enabled=False,
        )

        match_result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert len(match_result.scores) == 3

    async def test_calibration_injected_into_prompt(self):
        profiles = await self._create_profiles(3)

        review_note = "not a fit re seeks/offers"
        await gen_llm_scoring(profiles[0], self.user, score_by_llm=80)
        await gen_user_review(profiles[0], self.user, score_by_user=60, review_note=review_note)

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
        result = await sync_to_async(_score_matches_batch_by_llm)(profiles, config)

        assert config.calibration_xml_tag in result.prompt
        assert review_note in result.prompt
