import strawberry
from collections.abc import Iterator
from django.conf import settings
from django_extensions.db.fields import AutoSlugField
from graphql.error import GraphQLError
from strawberry.extensions import MaskErrors
from strawberry.extensions import ParserCache
from strawberry.schema.config import StrawberryConfig
from strawberry.tools import merge_types
from strawberry_django.fields.types import field_type_map
from strawberry_django.optimizer import DjangoOptimizerExtension

from neuronhub.apps.db.fields import MarkdownField

# configure before types that use them
field_type_map.update(
    {
        MarkdownField: str,
        AutoSlugField: str,
    }
)
# import types relying on field_type_map
from neuronhub.apps.posts.graphql.mutations import PostsMutation
from neuronhub.apps.posts.graphql.resolvers import PostsQuery
from neuronhub.apps.users.graphql.mutations import UserMutation
from neuronhub.apps.users.graphql.resolvers import UsersQuery


class MaskErrorsIncludingValidation(MaskErrors):
    """
    Strawberry drops the original `raise ValidationError(...)` output,
    and replaces it with an unreadable GraphQL str crap instead.

    This adds ValidationErrors back to `execution_context.errors`.
    """

    def on_validate(self) -> Iterator[None]:
        if self.execution_context.errors:
            processed_errors: list[GraphQLError] = []
            for error in self.execution_context.errors:
                if self.should_mask_error(error):
                    processed_errors.append(self.anonymise_error(error))
                else:
                    processed_errors.append(error)

            self.execution_context.errors = processed_errors
        yield


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


schema_extensions: list = [
    ParserCache(maxsize=128),  # 128 MB - when unset it grows indefinitely, polluting RAM
    DjangoOptimizerExtension,
]

if not settings.DEBUG:
    schema_extensions.append(MaskErrorsIncludingValidation())

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=schema_extensions,
    config=StrawberryConfig(
        auto_camel_case=False,
    ),
)
