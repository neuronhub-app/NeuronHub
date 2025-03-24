from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.services.create_tag import create_tag


class ToolModelsTest(NeuronTestCase):
    async def test_tool_tag_create(self):
        await create_tag(name_raw="Dev / License / GPL v2", author=self.user)
        assert await ToolTag.objects.filter(author=self.user, name="Dev").afirst()
        assert await ToolTag.objects.filter(author=self.user, name="License").afirst()
        assert await ToolTag.objects.filter(author=self.user, name="GPL v2").afirst()

    async def test_tool_tag_create_2(self):
        await create_tag(name_raw="Dev / TypeScript", author=self.user)
        assert await ToolTag.objects.filter(author=self.user, name="Dev").afirst()
        assert await ToolTag.objects.filter(author=self.user, name="TypeScript").afirst()
