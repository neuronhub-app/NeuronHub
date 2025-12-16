from dataclasses import dataclass

from asgiref.sync import async_to_sync
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest
from django.test import RequestFactory
from django.test import TestCase
from django.test import override_settings
from strawberry.types import ExecutionResult

from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.models import User
from neuronhub.graphql import schema
from neuronhub.settings import AlgoliaConfig
from neuronhub.settings import DjangoEnv


# Note: INSTALLED_APPS are already loaded when this is read, so the override is only ~50% effective
@override_settings(
    DJANGO_ENV=DjangoEnv.DEV_TEST_UNIT,
    SIMPLE_HISTORY_ENABLED=False,
    ALGOLIA=AlgoliaConfig(
        IS_ENABLED=False,
        AUTO_INDEXING=False,
        APPLICATION_ID="",
        API_KEY="",
        SEARCH_API_KEY="",
        INDEX_SUFFIX="",
    ),
)
class NeuronTestCase(TestCase):
    gen: Gen
    user: User

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.gen = async_to_sync(Gen.create)()
        cls.user = cls.gen.users.user_default

    async def graphql_query(
        self,
        query: str,
        variables: dict = None,
        user_authed: User | AnonymousUser | None = None,
    ) -> ExecutionResult:
        request = RequestFactory().get("/graphql")
        request.user = user_authed or self.user

        return await schema.execute(
            query,
            variable_values=variables,
            context_value=StrawberryContext(request=request),
        )


@dataclass
class StrawberryContext:
    request: HttpRequest
