from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.tests.test_gen import PostsGen


class PostAlgoliaFieldsTest(NeuronTestCase):
    async def test_has_github_url_true(self):
        tool = await self.gen.posts.create(
            PostsGen.Params(github_url="https://github.com/example/repo")
        )
        assert tool.get_has_github_url() is True

    async def test_has_github_url_false_when_empty(self):
        tool = await self.gen.posts.tool()
        assert tool.get_has_github_url() is False
