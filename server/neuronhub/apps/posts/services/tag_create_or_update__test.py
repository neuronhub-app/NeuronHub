from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update


class ToolModelsTest(NeuronTestCase):
    async def test_tag_parent_creation_with_the_string_slash_separator(self):
        tool = await self.gen.posts.create()
        await tag_create_or_update(
            name_raw="Dev / License / GPL v2", author=self.user, post=tool
        )
        assert await PostTag.objects.filter(author=self.user, name="Dev").afirst()
        assert await PostTag.objects.filter(author=self.user, name="License").afirst()
        assert await PostTag.objects.filter(author=self.user, name="GPL v2").afirst()

        await tag_create_or_update(name_raw="Dev / TypeScript", author=self.user, post=tool)
        assert await PostTag.objects.filter(author=self.user, name="TypeScript").afirst()
