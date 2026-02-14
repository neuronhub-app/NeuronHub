from unittest.mock import patch

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.tasks import run_score_profiles
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TasksTest(NeuronTestCase):
    async def test_score_profiles_task_updates_match_processed_at(self):
        profile = await self.gen.profiles.profile(user=None, visibility=Visibility.PUBLIC)
        user = await self.gen.users.user()

        with patch(
            "neuronhub.apps.profiles.services.score_matches_by_llm._call_llm_api"
        ) as mock_llm_api:
            mock_llm_api.return_value = {
                "match_scores": [
                    {
                        "id": profile.id,
                        "match_score": 75,
                        "match_reasoning_note": "Test reason",
                    }
                ]
            }

            await run_score_profiles(
                user_id=user.id,
                user_profile="Test profile for matching",
                limit=10,
                batch_size=10,
                model="haiku",
            )

        match = await ProfileMatch.objects.aget(user=user, profile=profile)
        assert match.match_processed_at is not None
        assert match.match_score_by_llm == 75
