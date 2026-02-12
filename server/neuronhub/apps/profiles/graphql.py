import strawberry
import strawberry_django
from django.db.models import QuerySet
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

    skills: list[PostTagType]
    interests: list[PostTagType]

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Profile], info: Info) -> QuerySet[Profile]:
        user = get_user_sync(info)
        return filter_profiles_by_user(user, profiles=queryset)

    @strawberry_django.field(extensions=[IsAuthenticated()])
    async def my_match(self: Profile, info: Info) -> ProfileMatchType | None:
        user = await get_user(info)
        match = (
            await ProfileMatch.objects.filter(profile=self, user=user)
            .order_by("-updated_at")
            .afirst()
        )
        return match  # type: ignore[return-value]  #bad-infer: Strawberry auto-converts model → type


@strawberry.type(name="Query")
class ProfilesQuery:
    profiles: list[ProfileType] = strawberry_django.field()


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
