import pytest

from neuronhub.apps.importer.models import ImportDomain, PostSource, UserSource
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.services.db_stubs_repopulate import post_HN_id
from neuronhub.apps.tests.test_cases import NeuronTestCase


class HackerNewsImportTest(NeuronTestCase):
    _story_id = post_HN_id

    @pytest.mark.slow
    async def test_import_story(self):
        post = await self._import_test_post()

        author_name = "pabs3"
        assert post.type == Post.Type.Post
        assert post.source_author == author_name

        source = await PostSource.objects.aget(post=post)
        assert source.domain == ImportDomain.HackerNews
        assert source.id_external == f"{self._story_id}"
        assert source.score >= 259

        user_source = await UserSource.objects.aget(username=author_name)
        assert user_source.id_external == author_name

    @pytest.mark.slow
    async def test_import_story_with_comment_ranks(self):
        await self._import_test_post()

        comment_sources_all: list[dict[str, int]] = []  # type: ignore # weird mypy, prob will work later
        async for source in (
            PostSource.objects.filter(post__type=Post.Type.Comment)
            .select_related("post")
            .values_list("id", "rank")
        ):
            comment_sources_all.append(source)

        comments_count = await Post.objects.filter(type=Post.Type.Comment).acount()
        comment_sources_ranked = 0
        for comment_id, rank in comment_sources_all:
            if rank is not None:
                comment_sources_ranked += 1

        assert len(comment_sources_all) == comment_sources_ranked, "All Comments must have .rank"
        assert len(comment_sources_all) == comments_count

        comments_with_parent = await Post.objects.filter(
            type=Post.Type.Comment,
            parent__isnull=False,
            parent_root__isnull=False,
        ).acount()
        assert comments_with_parent == comments_count

    async def _import_test_post(self):
        importer = ImporterHackerNews(is_use_cache=True, is_logs_enabled=False)
        return await importer.import_post(self._story_id)
