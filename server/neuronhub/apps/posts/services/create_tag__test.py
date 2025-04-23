from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.services.create_tag import create_tag


class ToolModelsTest(NeuronTestCase):
    async def test_tool_tag_create(self):
        tool = await self.gen.posts.create()
        await create_tag(name_raw="Dev / License / GPL v2", author=self.user, post=tool)
        assert await PostTag.objects.filter(author=self.user, name="Dev").afirst()
        assert await PostTag.objects.filter(author=self.user, name="License").afirst()
        assert await PostTag.objects.filter(author=self.user, name="GPL v2").afirst()

    async def test_tool_tag_create_2(self):
        tool = await self.gen.posts.create()
        await create_tag(name_raw="Dev / License / GPL v2", author=self.user, post=tool)
        await create_tag(name_raw="Dev / TypeScript", author=self.user, post=tool)
        assert await PostTag.objects.filter(author=self.user, name="Dev").afirst()
        assert await PostTag.objects.filter(author=self.user, name="TypeScript").afirst()
