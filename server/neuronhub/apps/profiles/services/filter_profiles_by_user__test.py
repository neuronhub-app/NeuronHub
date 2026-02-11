from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.profiles.services.filter_profiles_by_user import filter_profiles_by_user
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.models import UserConnectionGroup


# todo ! refac: dedup with [[filter_posts_by_user.py]]
# #AI
class FilterProfilesByUserTest(NeuronTestCase):
    async def test_public_visible_to_authed(self):
        await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        assert await filter_profiles_by_user(self.user).acount() == 1

    async def test_internal_visible_to_authed(self):
        await self.gen.profiles.profile(visibility=Visibility.INTERNAL)
        assert await filter_profiles_by_user(self.user).acount() == 1

    async def test_private_visible_only_to_owner(self):
        owner = await self.gen.users.user()
        await self.gen.profiles.profile(visibility=Visibility.PRIVATE, user=owner)

        assert await filter_profiles_by_user(owner).acount() == 1
        assert await filter_profiles_by_user(self.user).acount() == 0

    async def test_users_selected_visible_to_selected(self):
        owner = await self.gen.users.user()
        selected = await self.gen.users.user()
        await self.gen.profiles.profile(
            visibility=Visibility.USERS_SELECTED, user=owner, visible_to_users=[selected]
        )

        assert await filter_profiles_by_user(selected).acount() == 1
        assert await filter_profiles_by_user(self.user).acount() == 0

    async def test_connections_visible_to_connected(self):
        owner = await self.gen.users.user()
        connected = await self.gen.users.user()
        await self.gen.profiles.profile(visibility=Visibility.CONNECTIONS, user=owner)

        assert await filter_profiles_by_user(connected).acount() == 0

        group, _ = await owner.connection_groups.aget_or_create(
            name=UserConnectionGroup.NAME_DEFAULT
        )
        await group.connections.aadd(connected)
        assert await filter_profiles_by_user(connected).acount() == 1

    async def test_anon_sees_only_public(self):
        from django.contrib.auth.models import AnonymousUser

        await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        await self.gen.profiles.profile(visibility=Visibility.INTERNAL)
        await self.gen.profiles.profile(visibility=Visibility.PRIVATE, user=self.user)

        assert await filter_profiles_by_user(AnonymousUser()).acount() == 1

    # #AI
    async def test_group_members_see_each_other(self):
        group = await self.gen.profiles.group(name="EAG SF 2026")
        user_a = await self.gen.users.user()
        user_b = await self.gen.users.user()
        outsider = await self.gen.users.user()

        await self.gen.profiles.profile(
            user=user_a, visibility=Visibility.PRIVATE, groups=[group]
        )
        await self.gen.profiles.profile(
            user=user_b, visibility=Visibility.PRIVATE, groups=[group]
        )

        assert await filter_profiles_by_user(user_a).acount() == 2
        assert await filter_profiles_by_user(user_b).acount() == 2
        assert await filter_profiles_by_user(outsider).acount() == 0

    # #AI. Also, i don't like this behavior. Though it respects the business logic.
    async def test_group_without_user_visible_to_members(self):
        group = await self.gen.profiles.group(name="Test Group")
        member = await self.gen.users.user()
        await self.gen.profiles.profile(
            user=member, visibility=Visibility.PRIVATE, groups=[group]
        )
        # CSV-imported profile: no user, but in same group
        await self.gen.profiles.profile(user=None, visibility=Visibility.PRIVATE, groups=[group])

        assert await filter_profiles_by_user(member).acount() == 2
