from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.graphql.types import UserType


class TestUserTypeHasProfileGroups(NeuronTestCase):
    async def test_false_when_profile_without_groups(self):
        user = await self.gen.users.user()
        await self.gen.profiles.profile(user=user)
        assert await UserType.has_profile_groups(user) is False

    async def test_true_when_profile_has_groups(self):
        user = await self.gen.users.user()
        group = await self.gen.profiles.group(name="EAG 2026")
        await self.gen.profiles.profile(user=user, groups=[group])
        assert await UserType.has_profile_groups(user) is True
