from django.conf import settings
from graphql import GraphQLError
from strawberry.extensions import SchemaExtension
from strawberry.types import ExecutionResult
from strawberry_django.auth.utils import aget_current_user


class LoginRequiredExtension(SchemaExtension):
    """
    Temp non authed users block until v0.3.
    """

    async def on_execute(self):
        query = self.execution_context.query
        if (
            settings.E2E_TEST
            and query
            and "test_db_stubs_repopulate" in self.execution_context.query
        ):
            yield
            return

        user = await aget_current_user(self.execution_context)
        if not getattr(user, "is_authenticated", False):
            self.execution_context.result = ExecutionResult(
                data=None,
                errors=[GraphQLError(message="Login required")],
            )
        yield
