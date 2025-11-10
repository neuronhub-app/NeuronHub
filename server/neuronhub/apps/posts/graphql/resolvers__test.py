from django.contrib.auth.models import AnonymousUser

from neuronhub.apps.anonymizer.fields import Visibility

from neuronhub.apps.tests.test_cases import NeuronTestCase


class PostGraphqlResolversTest(NeuronTestCase):
    async def test_a_public_Review_of_a_private_Tool(self):
        tool = await self.gen.posts.tool(visibility=Visibility.PRIVATE)
        await self.gen.posts.review(tool=tool)
        res = await self.graphql_query(
            """
                query ReviewList {
                    post_reviews {
                        parent { id }
                        author { id }
                        comments_count
                    }
                }
            """,
            user_authed=AnonymousUser(),
        )
        assert not res.errors
