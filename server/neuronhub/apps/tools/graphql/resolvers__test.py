from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.graphql import schema


class ToolMutationTest(NeuronTestCase):
    async def test_async_generic_releation_resolver(self):
        comment = await self.gen.comments.create()

        resp = await schema.execute(
            """
                query Review($id: ID!) {
                    tool_review(id: $id) {
                        comments {
                            id
                            content
                        }
                    }
                }
            """,
            variable_values={
                "id": comment.object_id,
            },
        )

        assert resp.errors is None
        assert type(resp.data["tool_review"]["comments"][0]["content"]) is str
