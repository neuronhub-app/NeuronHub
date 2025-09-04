from asgiref.sync import async_to_sync, sync_to_async

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate

from neuronhub.apps.tests.test_cases import NeuronTestCase


class GraphqlTypesOptimizerTest(NeuronTestCase):
    async def test_post_reviews_requires_below_17_SQL_queries(self):
        await db_stubs_repopulate()
        for _ in range(5):
            await self.gen.posts.tag(post=await self.gen.posts.review())

        await sync_to_async(self._assert_num_queries)(number=17)

    def _assert_num_queries(self, number: int):
        with self.assertNumQueries(number):
            async_to_sync(self.graphql_query)(
                # this is a core snap of urls.reviews.list query
                """
                    query ReviewList {
                        post_reviews(ordering: {reviewed_at: DESC}) {
                            ...PostReviewFragment
                        }
                    }
                    fragment PostReviewFragment on PostReviewType {
                        ...PostFragment
                        review_tags { ...PostTagFragment }
                    }
                    fragment PostFragment on PostTypeI {
                        author {
                            avatar { url }
                        }
                        votes {
                            author { id }
                        }
                        comments {
                            author { id username }
                            parent { id }
                        }
                        parent {
                            ... on PostToolType {
                                tool_type
                            }
                            tags { ...PostTagFragment }
                        }
                        updated_at
                        tags { ...PostTagFragment }
                    }
                    fragment PostTagFragment on PostTagType {
                        label
                        votes {
                            id
                            post { id }
                            author { id username }
                        }
                        author { id username }
                        tag_parent { id name }
                        tag_children { id }
                    }
                """
            )
