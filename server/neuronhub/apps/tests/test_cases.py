from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from asgiref.sync import async_to_sync
from django.http import HttpRequest
from django.test import RequestFactory
from django.test import TestCase
from strawberry.types import ExecutionResult

from neuronhub.apps.tests.test_gen import Gen
from neuronhub.graphql import schema


if TYPE_CHECKING:
    from neuronhub.apps.users.models import User


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
        user_authed: User | None = None,
    ) -> ExecutionResult:
        request = RequestFactory().get("/graphql")
        request.user = user_authed or self.user

        return await schema.execute(
            query,
            variable_values=variables,
            context_value=Context(request=request),
        )


@dataclass
class Context:
    request: HttpRequest
