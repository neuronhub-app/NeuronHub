from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.filter_posts_by_user import filter_posts_by_user
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.models import User, UserConnectionGroup


class VisibilityTest(NeuronTestCase):
    async def test_visibility_by_connection(self):
        post = await self.gen.posts.create()
        user_author = await self.gen.users.user()
        user_connection = await self.gen.users.user()

        await self.gen.posts.comment(post, author=user_author, visibility=Visibility.PUBLIC)
        await self.gen.posts.comment(post, author=user_author, visibility=Visibility.CONNECTIONS)
        assert await _visible_comments(post, user_connection) == 1, "Not connected yet"

        await _add_connection(user_author, connection_new=user_connection)
        assert await _visible_comments(post, user_connection) == 2

        user_unrelated = await self.gen.users.user()
        assert await _visible_comments(post, user_unrelated) == 1

    async def test_visibility_by_users_selected(self):
        post = await self.gen.posts.create()

        user_author = await self.gen.users.user()
        user_selected = await self.gen.users.user()
        await self.gen.posts.comment(
            post,
            author=user_author,
            visibility=Visibility.USERS_SELECTED,
            visible_to_users=[user_selected],
        )
        assert await _visible_comments(post, user_selected) == 1

        user_unrelated = await self.gen.users.user()
        assert await _visible_comments(post, user_unrelated) == 0

    async def test_visibility_private(self):
        post = await self.gen.posts.create()
        user_author = await self.gen.users.user()
        await self.gen.posts.comment(post, author=user_author, visibility=Visibility.PRIVATE)
        assert await _visible_comments(post, user_author) == 1, "Author sees own"

        user_reader = await self.gen.users.user()
        assert await _visible_comments(post, user_reader) == 0, "Private is invisible"


async def _add_connection(user: User, connection_new: User):
    group_default, _ = await user.connection_groups.aget_or_create(
        name=UserConnectionGroup.NAME_DEFAULT
    )
    await group_default.connections.aadd(connection_new)


async def _visible_comments(post: Post, user: User):
    return await filter_posts_by_user(user, post.children.all()).acount()
