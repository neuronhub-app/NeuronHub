from asgiref.sync import sync_to_async

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.services.filter_posts_by_user import filter_posts_by_user
from neuronhub.apps.tests.test_cases import NeuronTestCase


class VisibilityTest(NeuronTestCase):
    async def test_visibility_by_connections(self):
        parent = await self.gen.posts.create()

        user = self.user
        user2 = await self.gen.users.user()

        comment1 = await self.gen.posts.comment(parent, author=user)
        await self.gen.posts.comment(parent, author=user2, visibility=Visibility.CONNECTIONS)
        comments = await filter_posts_by_user(user, parent.children.all())
        assert await comments.acount() == 1

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(user.id)
        comments = await filter_posts_by_user(user, parent.children.all())
        assert await comments.acount() == 2

        user3 = await self.gen.users.user()
        comments = await filter_posts_by_user(user3, parent.children.all())
        assert await comments.acount() == 1

    async def test_visibility_by_user(self):
        post = await self.gen.posts.create()

        user2 = await self.gen.users.user()

        comment = await self.gen.posts.comment(author=self.user, parent=post)
        comment2 = await self.gen.posts.comment(
            author=user2,
            parent=post,
            visibility=Visibility.USERS_SELECTED,
            visible_to_users=[self.user],
        )
        comments = await filter_posts_by_user(self.user, post.children.all())
        assert await comments.acount() == 2

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(self.user.id)
        comments = await filter_posts_by_user(self.user, post.children.all())
        assert await comments.acount() == 2

        user3 = await self.gen.users.user()
        comments = await filter_posts_by_user(user3, post.children.all())
        assert await comments.acount() == 1

    async def test_visibility_private(self):
        post = await self.gen.posts.create()

        user2 = await self.gen.users.user()

        await self.gen.posts.comment(author=self.user, parent=post)
        comments = await filter_posts_by_user(self.user, post.children.all())
        assert await comments.acount() == 1

        comment2 = await self.gen.posts.comment(
            parent=post,
            author=user2,
            visibility=Visibility.PRIVATE,
        )
        comments = await filter_posts_by_user(self.user, post.children.all())
        assert await comments.acount() == 1
