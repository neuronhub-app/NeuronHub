import strawberry
from django_extensions.db.fields import AutoSlugField
from strawberry.extensions import ParserCache
from strawberry.schema.config import StrawberryConfig
from strawberry.tools import merge_types
from strawberry_django.fields.types import field_type_map
from strawberry_django.optimizer import DjangoOptimizerExtension

from neuronhub.apps.db.fields import MarkdownField

# Add missing types:
field_type_map.update(
    {
        MarkdownField: str,
        AutoSlugField: str,
    }
)
# imports that rely on [[field_type_map]] we modify above
from neuronhub.apps.users.graphql.resolvers import UsersQuery
from neuronhub.apps.posts.graphql.resolvers import PostsQuery
from neuronhub.apps.posts.graphql.mutations import PostsMutation
from neuronhub.apps.tests.graphql.mutations import TestsMutation
from neuronhub.apps.users.graphql.mutations import UserMutation


Query = merge_types(
    "Query",
    types=(UsersQuery, PostsQuery),
)


@strawberry.type
class Mutation(UserMutation, PostsMutation, TestsMutation):
    pass


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        ParserCache(maxsize=128),  # 128 MB; it clogs RAM indefinitely by default
        DjangoOptimizerExtension,
    ],
    config=StrawberryConfig(auto_camel_case=False),
)
