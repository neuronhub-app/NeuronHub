import strawberry
from strawberry import Info

from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.posts.models import Post


@strawberry.type
class PostImportRefreshResult:
    comments_added: int


@strawberry.type
class ImporterMutation:
    @strawberry.mutation
    async def post_import_refresh(self, id_external: str, info: Info) -> PostImportRefreshResult:
        post = await Post.objects.filter(post_source__id_external=id_external).afirst()
        if not post:
            return PostImportRefreshResult(comments_added=0)

        comments_before = await Post.objects.filter(parent=post, type=Post.Type.Comment).acount()

        importer = ImporterHackerNews(is_logs_enabled=False, is_use_cache=False)
        await importer.import_post(id_ext=int(id_external))

        comments_after = await Post.objects.filter(parent=post, type=Post.Type.Comment).acount()

        return PostImportRefreshResult(comments_added=comments_after - comments_before)
