from asgiref.sync import sync_to_async

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.graphql.resolvers import get_comments_visible
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.graphql import schema


class PostResolversTest(NeuronTestCase):
    async def test_visibility_by_connections(self):
        parent: Post = await self.gen.posts.create()

        user = self.user
        user2 = await self.gen.users.user()

        comment1 = await self.gen.posts.comment(parent, author=user)
        await self.gen.posts.comment(parent, author=user2, visibility=Visibility.CONNECTIONS)
        comments = await get_comments_visible(parent, user=user)
        assert await comments.acount() == 1

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(user.id)
        comments = await get_comments_visible(parent, user=user)
        assert await comments.acount() == 2

        user3 = await self.gen.users.user()
        comments = await get_comments_visible(parent, user=user3)
        assert await comments.acount() == 1

    async def test_visibility_by_user(self):
        post = await self.gen.posts.create()

        user2 = await self.gen.users.user()

        comment = await self.gen.posts.comment(author=self.user, post=post)
        comment2 = await self.gen.posts.comment(
            author=user2,
            post=post,
            visibility=Visibility.USERS_SELECTED,
            visible_to_users=[self.user],
        )
        comments = await get_comments_visible(user=self.user, post=post)
        assert await comments.acount() == 2

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(self.user.id)
        comments = await get_comments_visible(user=self.user, post=post)
        assert await comments.acount() == 2

        user3 = await self.gen.users.user()
        comments = await get_comments_visible(user=user3, post=post)
        assert await comments.acount() == 1

    async def test_visibility_private(self):
        post = await self.gen.posts.create()

        user2 = await self.gen.users.user()

        await self.gen.posts.comment(author=self.user, post=post)
        comments = await get_comments_visible(user=self.user, post=post)
        assert await comments.acount() == 1

        comment2 = await self.gen.posts.comment(
            post=post,
            author=user2,
            visibility=Visibility.PRIVATE,
        )
        comments = await get_comments_visible(user=self.user, post=post)
        assert await comments.acount() == 1

    async def test_async_resolver(self):
        post = await self.gen.posts.create()
        await self.gen.posts.comment(post=post, author=self.user)

        resp = await schema.execute(
            """
                query Post($id: ID!) {
                    post(id: $id) {
                        id
                        content
                        children {
                            id
                            content
                        }
                    }
                }
            """,
            variable_values={
                "id": post.id,
            },
        )

        assert resp.errors is None
        assert type(resp.data["post"]["children"][0]["content"]) is str
