from asgiref.sync import sync_to_async
from django.db.models import F
from django.db.models import Q
from django.db.models import QuerySet
from django_tasks import task

from neuronhub.apps.profiles.models import Profile
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
    include_reprocessing: bool = True,
    is_logs_enabled: bool = True,
):
    await run_score_profiles(
        user_id,
        user_profile,
        limit,
        batch_size,
        model,
        include_reprocessing,
        is_logs_enabled=is_logs_enabled,
    )


# #AI i don't see why not call @task
async def run_score_profiles(
    user_id: int,
    user_profile: str,
    limit: int,
    batch_size: int,
    model: str,
    include_reprocessing: bool = True,
    is_logs_enabled: bool = True,
):
    user = await User.objects.aget(id=user_id)
    profiles = get_profiles_to_score_qs(user, include_reprocessing).order_by("id")[:limit]

    await sync_to_async(score_matches_by_llm)(
        profiles,
        config=MatchConfig(
            user=user,
            user_profile=user_profile,
            batch_size=batch_size,
            model=model,
            is_dry_run=False,
            is_use_calibration=True,
            is_logs_enabled=is_logs_enabled,
        ),
    )


# #AI # todo ? refac: move out to score_matches_by_llm
def get_profiles_to_score_qs(user: User, is_reprocess_outdated: bool) -> QuerySet[Profile]:
    profiles_visible = filter_profiles_by_user(user)

    unprocessed = Q(match__isnull=True) | Q(match__match_processed_at__isnull=True)

    if is_reprocess_outdated:
        needs_reprocessing = Q(
            match__match_processed_at__isnull=False,
            content_updated_at__gt=F("match__match_processed_at"),
        )
        return profiles_visible.filter(unprocessed | needs_reprocessing)

    return profiles_visible.filter(unprocessed)
