from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.filter_posts_by_user import filter_posts_by_user
from neuronhub.apps.tests.test_cases import NeuronTestCase


class AuthorAlwaysSeesOwnPostTest(NeuronTestCase):
    async def _is_post_visible_to(self, post: Post, user) -> bool:
        return await filter_posts_by_user(user, Post.objects.filter(id=post.id)).aexists()

    async def test_author_sees_own_post_for_every_visibility_without_selection(self):
        author = await self.gen.users.user()

        failures = []
        for visibility in Visibility:
            post = await self.gen.posts.create(
                self.gen.posts.Params(
                    title=f"Own post {visibility.value}",
                    author=author,
                    visibility=visibility,
                )
            )
            is_visible = await self._is_post_visible_to(post, author)
            if not is_visible:
                failures.append(visibility.value)

        assert not failures, (
            "author does not see own post at visibility="
            f"{failures}. Expected: author sees own post at any visibility."
        )

    async def test_subscribers_visibility_is_handled_at_all(self):
        author = await self.gen.users.user()
        for visibility in (Visibility.SUBSCRIBERS, Visibility.SUBSCRIBERS_PAID):
            post = await self.gen.posts.create(
                self.gen.posts.Params(
                    title=f"Sub post {visibility.value}",
                    author=author,
                    visibility=visibility,
                )
            )
            assert await self._is_post_visible_to(post, author), (
                f"author does not see own {visibility.value} post"
            )


class NonAuthorVisibilityMatrixTest(NeuronTestCase):
    async def _count_visible(self, post: Post, user) -> int:
        return await filter_posts_by_user(user, Post.objects.filter(id=post.id)).acount()

    async def test_unselected_users_selected_post_hidden_from_others(self):
        author = await self.gen.users.user()
        reader = await self.gen.users.user()
        post = await self.gen.posts.create(
            self.gen.posts.Params(
                title="Users selected, none selected",
                author=author,
                visibility=Visibility.USERS_SELECTED,
            )
        )
        assert await self._count_visible(post, reader) == 0, (
            "leak: USERS_SELECTED with none selected is visible to an outsider"
        )

    async def test_subscribers_post_hidden_from_random_user(self):
        author = await self.gen.users.user()
        reader = await self.gen.users.user()
        post = await self.gen.posts.create(
            self.gen.posts.Params(
                title="Subscribers post",
                author=author,
                visibility=Visibility.SUBSCRIBERS,
            )
        )
        assert await self._count_visible(post, reader) == 0, (
            "leak: SUBSCRIBERS post is visible to a random user"
        )

    async def test_private_post_hidden_from_others_visible_to_author(self):
        author = await self.gen.users.user()
        reader = await self.gen.users.user()
        post = await self.gen.posts.create(
            self.gen.posts.Params(title="Private", author=author, visibility=Visibility.PRIVATE)
        )
        assert await self._count_visible(post, author) == 1, (
            "author does not see own PRIVATE post"
        )
        assert await self._count_visible(post, reader) == 0, (
            "leak: PRIVATE post visible to an outsider"
        )


class GraphqlListAuthorVisibilityTest(NeuronTestCase):
    async def test_author_post_appears_in_posts_list_for_each_visibility(self):
        author = await self.gen.users.user()

        failures = []
        for visibility in Visibility:
            await self.gen.posts.create(
                self.gen.posts.Params(
                    title=f"List check {visibility.value}",
                    author=author,
                    visibility=visibility,
                )
            )

        result = await self.graphql_query(
            """
            query Posts { posts { id title visibility } }
            """,
            user_authed=author,
        )
        assert not result.errors, result.errors
        titles_visible = {p["title"] for p in result.data["posts"]}

        for visibility in Visibility:
            title = f"List check {visibility.value}"
            if title not in titles_visible:
                failures.append(visibility.value)

        assert not failures, (
            f"GraphQL `posts`: author does not see own post in the list at visibility={failures}"
        )
