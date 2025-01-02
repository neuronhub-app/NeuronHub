import strawberry
from strawberry.extensions import ParserCache
from strawberry.schema.config import StrawberryConfig
from strawberry.tools import merge_types

from neuronhub.apps.tools.graphql.resolvers import ToolsQuery
from neuronhub.apps.users.graphql.mutations import UserMutation
from neuronhub.apps.users.graphql.resolvers import UsersQuery


Query = merge_types(
    "Query",
    types=(
        UsersQuery,
        ToolsQuery,
    ),
)


@strawberry.type
class Mutation(UserMutation):
    pass


schema_extensions = [
    ParserCache(maxsize=128),  # 128 MB, when unset grows indefinitely, polluting RAM
]

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=schema_extensions,
    config=StrawberryConfig(
        auto_camel_case=False,
    ),
)
