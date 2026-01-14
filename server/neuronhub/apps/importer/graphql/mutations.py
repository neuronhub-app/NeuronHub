import strawberry
from strawberry import Info
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.graphql.persisted_query_extension import GraphqlQuery
from neuronhub.apps.graphql.persisted_query_extension import graphql_whitelist_BE
from neuronhub.apps.importer.models import ImportTaskCronAuthToken
from neuronhub.apps.importer.tasks import import_hn_post
from neuronhub.apps.importer.tasks import import_hn_posts
from neuronhub.apps.posts.models import Post
from neuronhub.apps.users.graphql.resolvers import get_user


@strawberry.type
class ImporterMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_import_refresh(self, id_external: int, info: Info) -> bool:
        user = await get_user(info)
        assert user.is_superuser

        post = await Post.objects.filter(post_source__id_external=id_external).afirst()
        if not post:
            return False

        await import_hn_post.aenqueue(id_external=id_external)
        return True

    @strawberry.mutation
    async def posts_import(
        self,
        auth_token: str,
        category: str,
        limit: int = 60,
        is_use_cache: bool = False,
    ) -> bool:
        assert await ImportTaskCronAuthToken.objects.aget(token=auth_token)

        await import_hn_posts.aenqueue(category=category, limit=limit, is_use_cache=is_use_cache)
        return True


graphql_whitelist_BE.register(
    GraphqlQuery(
        op_name="posts_import",
        query="""
            mutation posts_import(
                $auth_token: String!
                $category: String!
                $limit: Int!
            ) {
                posts_import(
                    auth_token: $auth_token
                    category: $category
                    limit: $limit
                )
            }
        """,
    )
)
