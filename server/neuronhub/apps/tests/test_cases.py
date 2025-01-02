from dataclasses import dataclass

from django.http import HttpRequest
from django.test import RequestFactory
from django.test import TestCase
from strawberry.types import ExecutionResult

from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.models import User
from neuronhub.graphql import schema


class NeuronTestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.gen = Gen()

    def graphql_query(
        self,
        query: str,
        variables: dict = None,
        user_authed: User | None = None,
    ) -> ExecutionResult:
        request = RequestFactory().get("/graphql")
        request.user = user_authed

        return schema.execute_sync(
            query,
            variable_values=variables,
            context_value=Context(request=request),
        )


@dataclass
class Context:
    request: HttpRequest
