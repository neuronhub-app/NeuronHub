import json
from pathlib import Path

from neuronhub.apps.importer.models import ImportDomain, PostSource, UserSource
from neuronhub.apps.importer.services.hackernews import _import_post_json
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


class HackerNewsImportTest(NeuronTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # todo refac: drop, and add file cache to request_json when called with is_test=True
        stubs_path = Path(__file__).parent.parent / "tests/stubs"
        with open(stubs_path / "al-story.json") as f:
            cls.story_algolia = json.load(f)
        with open(stubs_path / "fb-story.json") as f:
            cls.story_fb = json.load(f)

    async def test_import_story(self):
        post = await _import_post_json(self.story_algolia)

        author_name = "Cogito"
        assert post.type == Post.Type.Post
        assert "Stephen" in post.title
        assert post.source_author == author_name

        source = await PostSource.objects.aget(post=post)
        assert source.domain == ImportDomain.HackerNews
        assert source.id_external == "16582136"
        assert source.score == 6015
        assert "bbc.com" in source.url_of_source

        user_source = await UserSource.objects.aget(username=author_name)
        assert user_source.id_external == author_name

    async def test_import_nested_comments(self):
        post = await _import_post_json(self.story_algolia)

        comments = await Post.comments.filter(parent=post).acount()
        assert comments == 15
