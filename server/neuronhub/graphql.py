import strawberry
from django_extensions.db.fields import AutoSlugField
from strawberry.extensions import ParserCache
from strawberry.schema.config import StrawberryConfig
from strawberry.tools import merge_types
from strawberry_django.fields.types import field_type_map
from strawberry_django.optimizer import DjangoOptimizerExtension

from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.posts.graphql.mutations import PostsMutation
from neuronhub.apps.posts.graphql.resolvers import PostsQuery
from neuronhub.apps.users.graphql.mutations import UserMutation
from neuronhub.apps.users.graphql.resolvers import UsersQuery


Query = merge_types(
    "Query",
    types=(
        UsersQuery,
        PostsQuery,
    ),
)


@strawberry.type
class Mutation(UserMutation, PostsMutation):
    pass


schema_extensions = [
    ParserCache(maxsize=128),  # 128 MB, when unset grows indefinitely, polluting RAM
    DjangoOptimizerExtension,
]

field_type_map.update(
    {
        MarkdownField: str,
        AutoSlugField: str,
    }
)

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=schema_extensions,
    config=StrawberryConfig(
        auto_camel_case=False,
    ),
)
