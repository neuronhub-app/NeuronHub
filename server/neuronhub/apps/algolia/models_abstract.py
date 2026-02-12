from typing import Any

from asgiref.sync import async_to_sync
from django.db.models import ManyToManyField
from django.test import RequestFactory
from django_choices_field import TextChoicesField

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.graphql.persisted_query_extension import _load_client_persisted_queries_json
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@anonymizer.register
class AlgoliaModel(AnonimazableTimeStampedModel):
    visible_to_users: ManyToManyField[User, User]
    visible_to_groups: ManyToManyField[UserConnectionGroup, UserConnectionGroup]
    visibility = TextChoicesField(Visibility, default=Visibility.PRIVATE)

    class Meta:
        abstract = True

    # from frontend query
    graphql_query_for_algolia: str = "PostsByIds"
    graphql_query_for_algolia_field: str = "posts"

    _graphql_algolia_cache: dict[str, Any] | None = {}

    def is_in_algolia_index(self) -> bool:
        return True

    def get_visible_to(self) -> list[str]:
        if self.visibility is Visibility.PRIVATE:
            assert self.author
            return [self.author.username]

        if self.visibility in [Visibility.INTERNAL, Visibility.PUBLIC]:
            return [f"group/{self.visibility.value}"]

        visible_to: list[str] = []

        if self.visibility in [Visibility.USERS_SELECTED, Visibility.CONNECTIONS]:
            # `list()` are only for Mypy #bad-infer
            visible_to.extend(list(*self.visible_to_users.all().values_list("username")))

        if self.visibility is Visibility.USERS_SELECTED:
            for group in self.visible_to_groups.all():
                visible_to.extend(list(*group.connections.all().values_list("username")))

        if self.visibility is Visibility.CONNECTIONS:
            assert self.author
            for group in self.author.connection_groups.all():
                visible_to.extend(list(*group.connections.all().values_list("username")))

        return visible_to

    def get_id_as_str(self) -> str:
        return str(self.id)

    def get_iso_created_at(self) -> str:
        return self.created_at.isoformat()

    def get_iso_updated_at(self) -> str:
        return self.updated_at.isoformat()

    # Algolia needs Unix for sorting/filtering

    def get_unix_created_at(self) -> float:
        return self.created_at.timestamp()

    def get_unix_updated_at(self) -> float:
        return self.updated_at.timestamp()

    def get_created_at_unix_aggregated(self) -> float:
        if hasattr(self, "post_source") and self.post_source.created_at_external:
            return self.post_source.created_at_external.timestamp()
        return self.created_at.timestamp()

    def _get_graphql_field(self, field: str) -> Any | None:
        """
        We re-use the "PostsByIds" query to supply the identical JSON schema to FE from both Algolia and GraphQL.
        See [[Algolia.md]].

        Caches GraphQL to avoid N+1 in Algolia indexing.
        """
        from neuronhub.apps.tests.test_cases import StrawberryContext
        from neuronhub.graphql import schema

        if not self.is_in_algolia_index():  # should be redundant, but isn't
            return None

        if not self._graphql_algolia_cache:
            self._graphql_algolia_cache = {}

            request = RequestFactory().get("/graphql")
            superuser = User.objects.filter(is_superuser=True).last()
            assert superuser
            request.user = superuser
            response = async_to_sync(schema.execute)(
                query=_load_client_persisted_queries_json()[self.graphql_query_for_algolia],
                variable_values={"ids": [self.pk]},
                context_value=StrawberryContext(request=request),
            )
            assert response.data
            if posts := response.data[self.graphql_query_for_algolia_field]:
                self._graphql_algolia_cache = posts[0]

        return self._graphql_algolia_cache.get(field)
