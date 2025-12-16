import asyncio

from asgiref.sync import sync_to_async, async_to_sync

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate

from neuronhub.apps.tests.test_cases import NeuronTestCase


class PostGraphqlTypesTest(NeuronTestCase):
    async def test_post_reviews_requires_below_23_SQL_queries(self):
        await db_stubs_repopulate(is_import_HN_post=False, is_create_single_review=True)
        reviews = await asyncio.gather(*[self.gen.posts.review() for _ in range(5)])
        await asyncio.gather(*[self.gen.posts.tag(post=review) for review in reviews])

        await sync_to_async(self._assert_num_queries)(number=13)

    def _assert_num_queries(self, number: int):
        with self.assertNumQueries(number):
            async_to_sync(self.graphql_query)(  # FYI async_to_sync in assertNumQueries() is PITA
                # this is a core snap of urls.reviews.list query
                # language=GraphQL
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
                        comment_count
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
