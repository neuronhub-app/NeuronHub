from asgiref.sync import sync_to_async

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.comments.graphql.resolvers import _get_review_comments
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CommentResolversTest(NeuronTestCase):
    async def test_visibility_by_connections(self):
        review = await self.gen.tools.create_review()

        user2 = await self.gen.users.user()

        comment = await self.gen.comments.create(author=self.user, review=review)
        comment2 = await self.gen.comments.create(
            author=user2,
            review=review,
            visibility=Visibility.CONNECTIONS,
        )
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 1

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(self.user.id)
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 2

        user3 = await self.gen.users.user()
        comments = await _get_review_comments(user=user3, review=review)
        assert await comments.acount(), 1

    async def test_visibility_by_user(self):
        review = await self.gen.tools.create_review()

        user2 = await self.gen.users.user()

        comment = await self.gen.comments.create(author=self.user, review=review)
        comment2 = await self.gen.comments.create(
            author=user2,
            review=review,
            visibility=Visibility.USERS_SELECTED,
            visible_to_users=[self.user],
        )
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 1

        group = await user2.connection_groups.acreate(name="default")
        await sync_to_async(group.connections.add)(self.user.id)
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 2

        user3 = await self.gen.users.user()
        comments = await _get_review_comments(user=user3, review=review)
        assert await comments.acount(), 1

    async def test_visibility_private(self):
        review = await self.gen.tools.create_review()

        user2 = await self.gen.users.user()

        comment = await self.gen.comments.create(author=self.user, review=review)
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 1

        comment2 = await self.gen.comments.create(
            author=user2,
            review=review,
            visibility=Visibility.PRIVATE,
        )
        comments = await _get_review_comments(user=self.user, review=review)
        assert await comments.acount(), 1
