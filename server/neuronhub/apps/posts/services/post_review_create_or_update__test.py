from neuronhub.apps.posts.models import PostTagVote, PostTag
from neuronhub.apps.posts.services.post_review_create_or_update import (
    post_review_create_or_update,
)
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class ReviewCreateOrUpdateTest(NeuronTestCase):
    async def test_creates_PostTag_with_a_comment(self):
        tag_name = "Python"
        tag_comment = "comment"

        tool = await self.gen.posts.tool()
        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[
                    PostTagTypeInput(
                        name=f"Dev / {tag_name}", is_vote_positive=True, comment=tag_comment
                    )
                ],
            ),
        )
        assert 0 == await review.tags.acount()
        assert 1 == await tool.tags.acount()

        tag_vote = await tool.tag_votes.aget(tag__name=tag_name, author=self.user)
        assert tag_vote.comment == tag_comment
        assert tag_vote.is_vote_positive

    async def test_creates_a_PostTag_with_2_parents(self):
        tag_parent_parent_name = "Dev"
        tag_parent_name = "Language"
        tag_name = "Python"

        tool = await self.gen.posts.tool()
        await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[
                    PostTagTypeInput(
                        name=f"{tag_parent_parent_name} / {tag_parent_name} / {tag_name}"
                    )
                ],
            ),
        )
        tag = await tool.tags.select_related("tag_parent__tag_parent").aget(name=tag_name)
        assert tag.name == tag_name
        assert tag.tag_parent.name == tag_parent_name
        assert tag.tag_parent.tag_parent.name == tag_parent_parent_name

    async def test_PostTag_field_is_important_is_editable_by_author(self):
        author = self.user
        tool = await self.gen.posts.tool(author=author)
        tag_name = "Python"
        await post_review_create_or_update(
            author=author,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=f"Dev / {tag_name}", is_important=True)],
            ),
        )
        tag = await PostTag.objects.aget(name=tag_name, author=author)
        assert tag.is_important

    async def test_PostTag_field_is_important_is_non_editable_by_non_author(self):
        # PostTag.is_important puts it first in the UI - only author/admin can set it
        tool = await self.gen.posts.tool(author=self.user)
        non_author = await self.gen.users.user()
        tag = await self.gen.posts.tag("Dev / Rust", author=self.user, is_important=False)
        await post_review_create_or_update(
            author=non_author,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tag.name, is_important=True)],
            ),
        )
        await tag.arefresh_from_db()
        assert not tag.is_important

    async def test_Review_tags_are_added_to_Tool(self):
        tool = await self.gen.posts.tool()
        tag_name_1 = "Python"
        tag_name_2 = "Django"

        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tag_name_1)],
            ),
        )
        review_updated = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                id=review.id,
                title="Review updated",
                tags=[PostTagTypeInput(name=tag_name_1), PostTagTypeInput(name=tag_name_2)],
            ),
        )

        assert {tag_name_1, tag_name_2} == {tag.name async for tag in tool.tags.all()}
        assert 0 == await review_updated.tags.acount()

    async def test_Review_tags_editing_and_voting_updates_PostTagVote(self):
        tool = await self.gen.posts.tool()
        tag_name = "Python"

        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tag_name, is_vote_positive=True)],
            ),
        )

        await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                id=review.id,
                tags=[PostTagTypeInput(name=tag_name, is_vote_positive=False)],
            ),
        )
        tag_vote = await PostTagVote.objects.aget(
            post=tool,
            tag=await tool.tags.aget(name=tag_name),
            author=self.user,
        )
        assert tag_vote.is_vote_positive is False
