from asgiref.sync import sync_to_async

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


async def _get_visible_to(post: Post) -> list[str]:
    return await sync_to_async(post.get_visible_to)()


class GetVisibleToIncludesAuthorTest(NeuronTestCase):
    async def test_author_username_present_for_every_non_public_visibility(self):
        author = await self.gen.users.user()

        failures = []
        visibilities_user_scoped = [
            Visibility.PRIVATE,
            Visibility.USERS_SELECTED,
            Visibility.CONNECTIONS,
            Visibility.SUBSCRIBERS,
            Visibility.SUBSCRIBERS_PAID,
        ]
        for visibility in visibilities_user_scoped:
            post = await self.gen.posts.create(
                self.gen.posts.Params(
                    title=f"visible_to {visibility.value}",
                    author=author,
                    visibility=visibility,
                )
            )
            visible_to = await _get_visible_to(post)
            if author.username not in visible_to:
                failures.append((visibility.value, visible_to))

        assert not failures, (
            "author missing from Algolia visible_to "
            f"(visibility, visible_to)={failures}. As a result the author can't "
            "see own post in Algolia lists."
        )

    async def test_subscribers_visibility_is_not_empty(self):
        author = await self.gen.users.user()
        for visibility in (Visibility.SUBSCRIBERS, Visibility.SUBSCRIBERS_PAID):
            post = await self.gen.posts.create(
                self.gen.posts.Params(
                    title=f"subs {visibility.value}", author=author, visibility=visibility
                )
            )
            visible_to = await _get_visible_to(post)
            assert visible_to, (
                f"get_visible_to() is empty for {visibility.value} → post "
                "is indexed as visible to neither the author nor subscribers"
            )

    async def test_users_selected_includes_author_alongside_selected(self):
        author = await self.gen.users.user()
        selected = await self.gen.users.user()
        post = await self.gen.posts.create(
            self.gen.posts.Params(
                title="users_selected with one selected",
                author=author,
                visibility=Visibility.USERS_SELECTED,
                visible_to_users=[selected],
            )
        )
        visible_to = await _get_visible_to(post)
        assert selected.username in visible_to, "selected user must be present"
        assert author.username in visible_to, (
            "author missing from visible_to even when others are selected"
        )

    async def test_users_selected_with_two_selected_does_not_crash(self):
        author = await self.gen.users.user()
        selected_1 = await self.gen.users.user()
        selected_2 = await self.gen.users.user()
        post = await self.gen.posts.create(
            self.gen.posts.Params(
                title="users_selected with two selected",
                author=author,
                visibility=Visibility.USERS_SELECTED,
                visible_to_users=[selected_1, selected_2],
            )
        )
        visible_to = await _get_visible_to(post)
        assert {author.username, selected_1.username, selected_2.username} <= set(visible_to)

    async def test_connections_with_two_members_does_not_crash(self):
        from neuronhub.apps.users.models import UserConnectionGroup

        author = await self.gen.users.user()
        member_1 = await self.gen.users.user()
        member_2 = await self.gen.users.user()
        group, _ = await author.connection_groups.aget_or_create(
            name=UserConnectionGroup.NAME_DEFAULT
        )
        await group.connections.aadd(member_1, member_2)

        post = await self.gen.posts.create(
            self.gen.posts.Params(
                title="connections with two members",
                author=author,
                visibility=Visibility.CONNECTIONS,
            )
        )
        visible_to = await _get_visible_to(post)
        assert {author.username, member_1.username, member_2.username} <= set(visible_to)
