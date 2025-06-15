from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.tests.test_gen import PostParams


class PostResolversTest(NeuronTestCase):
    async def test_query_post_by_id(self):
        post = await self.gen.posts.create()
        await self.gen.posts.comment(post=post, author=self.user)

        resp = await self.graphql_query(
            """
                query Post($id: ID!) {
                    post(pk: $id) {
                        id
                        content
                        children {
                            id
                            content
                        }
                    }
                }
            """,
            variables={"id": post.id},
        )

        assert resp.errors is None
        assert type(resp.data["post"]["children"][0]["content"]) is str

    async def test_posts_query(self):
        post = await self.gen.posts.create()
        await self.gen.posts.comment(post=post, author=self.user)

        resp = await self.graphql_query(
            """
                query Posts {
                    posts {
                        id
                        content
                    }
                }
            """,
        )

        assert resp.errors is None
        assert type(resp.data["posts"][0]["content"]) is str

    async def test_posts_w_filters(self):
        post = await self.gen.posts.create()
        await self.gen.posts.comment(post=post, author=self.user)

        resp = await self.graphql_query(
            """
                query Posts {
                    posts(filters: { type: {exact: Post} } ) {
                        id
                        content
                    }
                }
            """,
        )

        assert resp.errors is None
        assert type(resp.data["posts"][0]["content"]) is str

    async def test_post_reviews(self):
        tool = await self.gen.posts.create(PostParams(type=Post.Type.Tool))
        review = await self.gen.posts.create(PostParams(type=Post.Type.Review, parent=tool))

        resp = await self.graphql_query(
            """
                query Posts {
                    post_reviews {
                        id
                        content
                    }
                }
            """,
        )

        assert resp.errors is None
        assert type(resp.data["post_reviews"][0]["content"]) is str

    async def test_post_reviews_with_stubs(self):
        await db_stubs_repopulate()

        resp = await self.graphql_query(
            """
                query Posts {
                    post_reviews {
                        id
                        parent { title }
                        title
                        content
                    }
                }
            """,
        )

        assert resp.errors is None
        assert len(resp.data["post_reviews"]) > 2
        assert type(resp.data["post_reviews"][0]["content"]) is str
