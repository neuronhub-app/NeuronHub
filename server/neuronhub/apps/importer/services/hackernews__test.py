from neuronhub.apps.importer.models import ImportDomain, PostSource, UserSource
from neuronhub.apps.importer.services.hackernews import import_post
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


class HackerNewsImportTest(NeuronTestCase):
    _story_id = 16582136

    async def test_import_story(self):
        post = await import_post(self._story_id, is_use_cache=True)

        author_name = "Cogito"
        assert post.type == Post.Type.Post
        assert "Stephen" in post.title
        assert post.source_author == author_name

        source = await PostSource.objects.aget(post=post)
        assert source.domain == ImportDomain.HackerNews
        assert source.id_external == f"{self._story_id}"
        assert source.score == 6015
        assert "bbc.com" in source.url_of_source

        user_source = await UserSource.objects.aget(username=author_name)
        assert user_source.id_external == author_name

    async def test_import_nested_comments(self):
        post = await import_post(self._story_id, is_use_cache=True)

        comments = await Post.comments.filter(parent=post).acount()
        assert comments > 0

    async def test_import_story_with_comment_ranks(self):
        post = await import_post(self._story_id, is_use_cache=True)

        comment_sources = []
        async for source in (
            PostSource.objects.filter(post__parent=post)
            .order_by("-rank")[:15]
            .values_list("rank", "id_external")
        ):
            comment_sources.append(source)

        for rank, _ in comment_sources:
            assert rank is not None
