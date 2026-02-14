from typing import cast

import strawberry
import strawberry_django
from algoliasearch_django import save_record
from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django_tasks.backends.database.models import DBTaskResult
from django_tasks.base import TaskResultStatus
from strawberry import ID
from strawberry import Info
from strawberry import auto
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.filter_profiles_by_user import filter_profiles_by_user
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

    @strawberry.field
    def percent(self) -> float:
        if self.total == 0:
            return 0.0
        return round((self.processed / self.total) * 100, 1)


@strawberry.type
class ProfileMatchStatsType:
    rated_count: int
    llm_scored_count: int


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
            )
            .order_by("-enqueued_at")
            .afirst()
        )
        if not active_task:
            return ProgressType(total=0, processed=0, is_processing=False)

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

    @strawberry.field(extensions=[IsAuthenticated()])
    async def profile_match_stats(self, info: Info) -> ProfileMatchStatsType:
        user = await get_user(info)
        rated_count = await ProfileMatch.objects.filter(
            user=user, match_score__isnull=False
        ).acount()
        llm_scored_count = await ProfileMatch.objects.filter(
            user=user, match_score_by_llm__isnull=False
        ).acount()
        return ProfileMatchStatsType(rated_count=rated_count, llm_scored_count=llm_scored_count)

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
    ) -> ProgressType:
        from neuronhub.apps.profiles.tasks import score_profiles_task

        user = await get_user(info)
        try:
            profile = await Profile.objects.aget(user=user)
            user_profile = profile.profile_for_llm_md or ""
        except Profile.DoesNotExist:
            user_profile = ""

        assert model in MODEL_LIMITS
        model_limit = MODEL_LIMITS.get(model)
        await score_profiles_task.aenqueue(
            user_id=user.id,
            user_profile=user_profile,
            limit=min(limit, model_limit["max"]),
            batch_size=10,
            model=model,
        )

        return ProgressType(total=limit, processed=0, is_processing=True, model=model)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def profile_matches_cancel_llm(self, info: Info) -> bool:
        from django_tasks.backends.database.models import DBTaskResult
        from django_tasks.base import TaskResultStatus

        updated = await DBTaskResult.objects.filter(
            task_path=SCORE_PROFILES_TASK,
            status__in=[TaskResultStatus.READY, TaskResultStatus.RUNNING],
        ).aupdate(status=TaskResultStatus.FAILED)
        return updated > 0


MODEL_LIMITS: dict[str, dict[str, int]] = {
    "haiku": {"max": 400, "default": 200},
    "sonnet": {"max": 80, "default": 40},
}
