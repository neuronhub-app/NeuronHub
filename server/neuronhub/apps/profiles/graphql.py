from typing import cast

import strawberry
import strawberry_django
from algoliasearch_django import save_record
from asgiref.sync import sync_to_async
from django.db.models import F
from django.db.models import Q
from django.db.models import QuerySet
from django_tasks.backends.database.models import DBTaskResult
from django_tasks.base import TaskResultStatus
from strawberry import ID
from strawberry import Info
from strawberry import auto
from strawberry_django.pagination import OffsetPaginated
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.filter_profiles_by_user import filter_profiles_by_user
from neuronhub.apps.profiles.services.get_sorted_by_match import (
    get_profiles_queryset_sorted_by_match,
)
from neuronhub.apps.profiles.services.send_dm import send_profile_dm
from neuronhub.apps.users.graphql.resolvers import get_user
from neuronhub.apps.users.graphql.resolvers import get_user_sync


@strawberry_django.filter_type(Profile, lookups=True)
class ProfileFilter:
    id: auto


@strawberry_django.type(ProfileMatch)
class ProfileMatchType:
    id: auto
    match_score_by_llm: auto
    match_reason_by_llm: auto
    match_score: auto
    match_review: auto
    match_processed_at: auto

    @strawberry_django.field(only=["match_score_by_llm"])
    async def is_scored_by_llm(root: ProfileMatch) -> bool:
        return root.match_score_by_llm is not None

    @strawberry_django.field(only=["match_review"])
    async def is_reviewed_by_user(root: ProfileMatch) -> bool:
        return bool(root.match_review and root.match_review.strip())


@strawberry_django.type(Profile, filters=ProfileFilter)
class ProfileType:
    id: auto
    first_name: auto
    last_name: auto
    company: auto
    job_title: auto
    career_stage: auto
    biography: auto
    seeks: auto
    offers: auto

    seeking_work: auto
    recruitment: auto

    country: auto
    city: auto

    url_linkedin: auto
    url_conference: auto

    profile_for_llm_md: auto
    is_profile_custom: auto

    skills: list[PostTagType]
    interests: list[PostTagType]

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Profile], info: Info) -> QuerySet[Profile]:
        user = get_user_sync(info)
        return filter_profiles_by_user(user, profiles=queryset)

    match: ProfileMatchType | None = strawberry_django.field(extensions=[IsAuthenticated()])


SCORE_PROFILES_TASK = "neuronhub.apps.profiles.tasks.score_profiles_task"


@strawberry.type
class ProgressType:
    total: int
    processed: int
    is_processing: bool
    model: str | None = None
    error: str | None = None

    @strawberry.field
    def percent(self) -> float:
        if self.total == 0:
            return 0.0
        return round((self.processed / self.total) * 100, 1)


@strawberry.type
class ProfileMatchStatsType:
    rated_count: int
    llm_scored_count: int
    unprocessed_count: int
    needs_reprocessing_count: int


@strawberry.type(name="Query")
class ProfilesQuery:
    profiles: list[ProfileType] = strawberry_django.field()

    # #AI-slop
    @strawberry_django.field(extensions=[IsAuthenticated()])
    async def my_profile(self, info: Info) -> ProfileType | None:
        user = await get_user(info)
        try:
            return cast(ProfileType, await Profile.objects.aget(user=user))
        except Profile.DoesNotExist:
            return None

    @strawberry.field(extensions=[IsAuthenticated()])
    async def profile_match_progress(self, info: Info) -> ProgressType:
        user = await get_user(info)

        active_task = (
            await DBTaskResult.objects.filter(
                task_path=SCORE_PROFILES_TASK,
                status__in=[TaskResultStatus.READY, TaskResultStatus.RUNNING],
                args_kwargs__kwargs__user_id=user.id,
            )
            .order_by("-enqueued_at")
            .afirst()
        )
        if not active_task:
            return await _check_failed_task(user)

        kwargs = active_task.args_kwargs.get("kwargs", {}) if active_task.args_kwargs else {}

        processed = await ProfileMatch.objects.filter(
            user=user, match_processed_at__gte=active_task.enqueued_at
        ).acount()

        return ProgressType(
            total=kwargs.get("limit", 0),
            processed=processed,
            is_processing=True,
            model=kwargs.get("model"),
        )

    @strawberry_django.offset_paginated(OffsetPaginated[ProfileType])
    def profiles_sorted_by_match(self, info: Info, sort: str) -> QuerySet[Profile]:
        user = get_user_sync(info)
        if not user.is_authenticated:
            return Profile.objects.none()
        return get_profiles_queryset_sorted_by_match(user, sort)

    # #AI
    @strawberry.field(extensions=[IsAuthenticated()])
    async def profile_match_stats(self, info: Info) -> ProfileMatchStatsType:
        user = await get_user(info)
        visible = filter_profiles_by_user(user)

        return ProfileMatchStatsType(
            rated_count=(
                await ProfileMatch.objects.filter(user=user, match_score__isnull=False).acount()
            ),
            llm_scored_count=(
                await ProfileMatch.objects.filter(
                    user=user, match_score_by_llm__isnull=False
                ).acount()
            ),
            unprocessed_count=(
                await visible.filter(
                    Q(match__isnull=True) | Q(match__match_processed_at__isnull=True)
                ).acount()
            ),
            needs_reprocessing_count=(
                await visible.filter(
                    match__match_processed_at__isnull=False,
                    content_updated_at__gt=F("match__match_processed_at"),
                ).acount()
            ),
        )

    @strawberry.field(extensions=[IsAuthenticated()])
    async def profile_user_llm_md(self, info: Info) -> str:
        user = await get_user(info)
        try:
            profile = await Profile.objects.aget(user=user)
            return profile.profile_for_llm_md or ""
        except Profile.DoesNotExist:
            return ""


@strawberry.type
class ProfilesMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_send_dm(self, profile_id: ID, message: str, info: Info) -> bool:
        sender = await get_user(info)
        profile = await Profile.objects.select_related("user").aget(id=profile_id)
        assert profile.user, "Profile has no user"
        assert profile.user.email, "Profile has no email"
        await send_profile_dm(user_sender=sender, receiver=profile.user, message=message)
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_match_score_update(
        self, profile_id: ID, match_score: int, info: Info
    ) -> bool:
        user = await get_user(info)
        await ProfileMatch.objects.aupdate_or_create(
            profile_id=profile_id,
            defaults={"match_score": match_score, "user": user},
        )
        profile = await Profile.objects.aget(id=profile_id)
        await sync_to_async(save_record)(profile)
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_match_review_update(
        self, profile_id: ID, match_review: str, info: Info
    ) -> bool:
        user = await get_user(info)
        await ProfileMatch.objects.aupdate_or_create(
            profile_id=profile_id,
            defaults={"match_review": match_review, "user": user},
        )
        profile = await Profile.objects.aget(id=profile_id)
        await sync_to_async(save_record)(profile)
        return True

    # AI
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_llm_md_update(self, profile_for_llm_md: str, info: Info) -> bool:
        user = await get_user(info)
        profile = await Profile.objects.aget(user=user)
        profile.is_profile_custom = True
        profile.profile_for_llm_md = profile_for_llm_md
        await profile.asave()
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_llm_md_reset(self, info: Info) -> bool:
        user = await get_user(info)
        profile = await Profile.objects.aget(user=user)
        profile.is_profile_custom = False
        await profile.asave()
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_matches_trigger_llm(
        self,
        info: Info,
        limit: int = 200,
        model: str = "haiku",
        include_reprocessing: bool = True,
    ) -> ProgressType:
        from neuronhub.apps.profiles.tasks import score_profiles_task

        user = await get_user(info)
        try:
            profile = await Profile.objects.aget(user=user)
            user_profile = profile.profile_for_llm_md or ""
        except Profile.DoesNotExist:
            user_profile = ""

        assert model in MODEL_LIMITS
        model_limit = MODEL_LIMITS[model]
        await score_profiles_task.aenqueue(
            user_id=user.id,
            user_profile=user_profile,
            limit=min(limit, model_limit["max"]),  # type: ignore[index] # bad-infer, see `assert`
            batch_size=10,
            model=model,
            include_reprocessing=include_reprocessing,
        )

        return ProgressType(total=limit, processed=0, is_processing=True, model=model)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_matches_cancel_llm(self, info: Info) -> bool:
        from django_tasks.backends.database.models import DBTaskResult
        from django_tasks.base import TaskResultStatus

        user = await get_user(info)
        updated = await DBTaskResult.objects.filter(
            task_path=SCORE_PROFILES_TASK,
            status__in=[TaskResultStatus.READY, TaskResultStatus.RUNNING],
            args_kwargs__kwargs__user_id=user.id,
        ).aupdate(status=TaskResultStatus.FAILED)
        return updated > 0


MODEL_LIMITS: dict[str, dict[str, int]] = {
    "haiku": {"max": 500, "default": 250},
    "sonnet": {"max": 100, "default": 50},
}


# #AI
async def _check_failed_task(user) -> ProgressType:
    latest_task = (
        await DBTaskResult.objects.filter(
            task_path=SCORE_PROFILES_TASK,
            args_kwargs__kwargs__user_id=user.id,
        )
        .order_by("-enqueued_at")
        .afirst()
    )
    if not latest_task or latest_task.status != TaskResultStatus.FAILED:
        return ProgressType(total=0, processed=0, is_processing=False)

    error_msg = latest_task.traceback or (
        f"Task failed: {latest_task.exception_class_path}"
        if latest_task.exception_class_path
        else None
    )
    if not error_msg:
        # Cancelled by user — not a real failure
        return ProgressType(total=0, processed=0, is_processing=False)

    kwargs = latest_task.args_kwargs.get("kwargs", {}) if latest_task.args_kwargs else {}
    return ProgressType(
        is_processing=False,
        error=error_msg,
        total=kwargs.get("limit", 0),
        model=kwargs.get("model"),
        processed=(
            await ProfileMatch.objects.filter(
                user=user, match_processed_at__gte=latest_task.enqueued_at
            ).acount()
        ),
    )
