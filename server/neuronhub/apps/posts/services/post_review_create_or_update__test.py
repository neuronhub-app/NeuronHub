from strawberry import UNSET

from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models import PostTagVote, Post
from neuronhub.apps.posts.services.post_review_create_or_update import (
    post_review_create_or_update,
)
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class ReviewCreateOrUpdateTest(NeuronTestCase):
    async def test_creates_PostTag_with_a_comment(self):
        tag_name = "Python"
        tag_input = PostTagTypeInput(name=f"Dev / {tag_name}", is_vote_positive=True)

        tool = await self.gen.posts.tool()
        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id), title="Review", tags=[tag_input]
            ),
        )
        assert await review.tags.acount() == 1  # Now review.tags stores author's selection
        assert await tool.tags.acount() == 1

        tag_vote = await tool.tag_votes.aget(tag__name=tag_name, author=self.user)
        assert tag_vote.is_vote_positive == tag_input.is_vote_positive

    async def test_tag_name_creates_parent(self):
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

    async def test_Review_tags_are_added_to_Tool_tags(self):
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
                tags=[PostTagTypeInput(name=tag_name_1), PostTagTypeInput(name=tag_name_2)],
            ),
        )

        assert {tag.name async for tag in tool.tags.all()} == {tag_name_1, tag_name_2}
        assert await review_updated.tags.acount() == 2

    async def test_comment_preservation_with_vote_updates(self):
        tool = await self.gen.posts.tool()

        # Review create
        tag_input = PostTagTypeInput(name="Name", comment="Comment", is_vote_positive=True)
        review_created = await post_review_create_or_update(
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id), title="Review", tags=[tag_input]
            ),
            author=self.user,
        )
        assert await self.is_vote_exists_exact(tool, tag_input)

        # Change vote
        tag_input.is_vote_positive = False
        post_input = PostTypeInput(id=review_created.id, tags=[tag_input])
        await post_review_create_or_update(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(tool, tag_input)

        # Remove vote -> keeps comment
        tag_input.is_vote_positive = None
        await post_review_create_or_update(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(tool, tag_input)

        # Remove vote + comment -> delete PostTagVote
        tag_input.comment = ""
        await post_review_create_or_update(author=self.user, data=post_input)
        assert not await self.is_vote_exists(tool, tag_input)

        # Comment add
        tag_input.comment = "comment new"
        tag_input.is_vote_positive = UNSET
        await post_review_create_or_update(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(tool, tag_input)

    @staticmethod
    async def is_vote_exists_exact(tool: Post, tag_input: PostTagTypeInput):
        # Convert UNSET to None for DB check, but keep False as False
        vote_value = None if tag_input.is_vote_positive is UNSET else tag_input.is_vote_positive
        return await PostTagVote.objects.filter(
            post=tool,
            tag__name=tag_input.name,
            is_vote_positive=vote_value,
            comment=tag_input.comment,
        ).aexists()

    @staticmethod
    async def is_vote_exists(tool: Post, tag_input: PostTagTypeInput):
        return await PostTagVote.objects.filter(post=tool, tag__name=tag_input.name).aexists()

    async def test_Review_review_tags_not_added_to_Tool_tags(self):
        tool = await self.gen.posts.tool()

        class tags:
            Tool = "Python"
            Review = ReviewTagName.stability.value

        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tags.Tool)],
                review_tags=[PostTagTypeInput(name=tags.Review, is_vote_positive=True)],
            ),
        )

        assert await tool.tags.filter(name=tags.Tool).acount() == 1
        assert await tool.tags.filter(name=tags.Review).acount() == 0

        assert await review.tags.filter(name=tags.Tool).acount() == 1
        assert await review.tags.filter(name=tags.Review).acount() == 0

        assert await review.review_tags.filter(name=tags.Tool).acount() == 0
        assert await review.review_tags.filter(name=tags.Review).acount() == 1

    async def test_review_tags_voting_and_UNSET_handling(self):
        class tags:
            stability_1 = "stability"
            value_2 = "value_2"

        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=(await self.gen.posts.tool()).id),
                title="Review",
                review_tags=[
                    PostTagTypeInput(
                        name=tags.stability_1, is_vote_positive=True, comment="Unst"
                    ),
                    PostTagTypeInput(name=tags.value_2, is_vote_positive=False, comment="Fine"),
                ],
            ),
        )

        # vote added
        review_tag_1 = await review.review_tags.filter(name=tags.stability_1).afirst()
        assert review_tag_1
        tag_1_vote = await review_tag_1.votes.aget()
        assert tag_1_vote.is_vote_positive is True

        # case is_vote_positive:
        #   null -> remove
        #   UNSET -> preserve
        result = await self.graphql_query(
            """
            mutation PostReviewCreateOrUpdate($data: PostTypeInput!) {
                post_review_create_or_update(data: $data) { id }
            }
            """,
            {
                "data": {
                    "id": review.id,
                    "review_tags": [
                        {"name": tags.stability_1},  # UNSET - should preserve
                        {"name": tags.value_2, "is_vote_positive": None},  # null - should remove
                    ],
                }
            },
        )
        assert not result.errors

        # vote is preserved
        tag_1_vote = await review_tag_1.votes.aget()
        assert tag_1_vote.is_vote_positive is True

        # vote removed
        tag_2 = await review.review_tags.aget(name=tags.value_2)
        assert not await tag_2.votes.aexists()

    # #AI
    async def test_removing_from_Review_tags_keeps_in_Tool_tags(self):
        tool = await self.gen.posts.tool()

        tag_name_1 = "Python"
        tag_name_2 = "Django"
        review = await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tag_name_1), PostTagTypeInput(name=tag_name_2)],
            ),
        )

        # remove tag_name_1
        await post_review_create_or_update(
            author=self.user,
            data=PostTypeInput(id=review.id, tags=[PostTagTypeInput(name=tag_name_2)]),
        )

        # Review.tags is updated
        review_tags = {tag.name async for tag in review.tags.all()}
        assert review_tags == {tag_name_2}

        # Tool.tags is kept
        tool_tags = {tag.name async for tag in tool.tags.all()}
        assert tool_tags == {tag_name_1, tag_name_2}
