from asgiref.sync import sync_to_async
from django_tasks import task

from neuronhub.apps.profiles.services.filter_profiles_by_user import filter_profiles_by_user
from neuronhub.apps.profiles.services.score_matches_by_llm import MatchConfig
from neuronhub.apps.profiles.services.score_matches_by_llm import score_matches_by_llm
from neuronhub.apps.users.models import User


@task()
async def score_profiles_task(
    user_id: int,
    user_profile: str,
    limit: int,
    batch_size: int,
    model: str,
):
    await run_score_profiles(user_id, user_profile, limit, batch_size, model)


async def run_score_profiles(
    user_id: int, user_profile: str, limit: int, batch_size: int, model: str
):
    user = await User.objects.aget(id=user_id)
    filter_profiles_by_user(user)
    profiles = filter_profiles_by_user(user).order_by("id")[:limit]

    config = MatchConfig(
        user=user,
        user_profile=user_profile,
        batch_size=batch_size,
        model=model,
        dry_run=False,
        use_calibration=True,
    )

    await sync_to_async(score_matches_by_llm)(profiles, config)
