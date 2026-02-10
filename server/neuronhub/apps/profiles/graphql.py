import strawberry
from strawberry import ID
from strawberry import Info
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.send_dm import send_profile_dm
from neuronhub.apps.users.graphql.resolvers import get_user


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
