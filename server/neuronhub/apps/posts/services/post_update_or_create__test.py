from strawberry import UNSET

from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.posts.models import PostTagVote, Post
from neuronhub.apps.posts.services.post_update_or_create import (
    post_update_or_create,
)
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CommentTest(NeuronTestCase):
    async def test_comment_create_sets_correct_type(self):
        post = await self.gen.posts.create()
        content_test = "Test comment content"

        comment = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                type=Post.Type.Comment,
                parent=PostTypeInput(id=post.id),
                content=content_test,
            ),
        )
        assert comment.type == Post.Type.Comment
        assert comment.content == content_test
        assert comment.parent_id == post.id
        assert comment.author_id == self.user.id


class ReviewCreateOrUpdateTest(NeuronTestCase):
    async def test_creates_PostTag_with_a_comment(self):
        tag_name = "Python"
        tag_input = PostTagTypeInput(name=f"Dev / {tag_name}", is_vote_positive=True)

        tool = await self.gen.posts.tool()
        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[tag_input],
                type=Post.Type.Review,
            ),
        )
        assert await review.tags.acount() == 1  # Now review.tags stores author's selection
        assert await tool.tags.acount() == 1

        tag_vote = await review.tag_votes.aget(tag__name=tag_name, author=self.user)
        assert tag_vote.is_vote_positive == tag_input.is_vote_positive

    async def test_Tag_name_creates_a_parent_Tag(self):
        tag_parent_parent_name = "Dev"
        tag_parent_name = "Language"
        tag_name = "Python"

        tool = await self.gen.posts.tool()
        await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                type=Post.Type.Review,
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

        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                type=Post.Type.Review,
                title="Review",
                tags=[PostTagTypeInput(name=tag_name_1)],
            ),
        )
        review_updated = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                id=review.id,
                type=Post.Type.Review,
                tags=[PostTagTypeInput(name=tag_name_1), PostTagTypeInput(name=tag_name_2)],
            ),
        )

        assert {tag.name async for tag in tool.tags.all()} == {tag_name_1, tag_name_2}
        assert await review_updated.tags.acount() == 2

    async def test_comment_preservation_with_vote_updates(self):
        tool = await self.gen.posts.tool()

        # Review create
        tag_input = PostTagTypeInput(name="Name", comment="Comment", is_vote_positive=True)
        review_created = await post_update_or_create(
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                type=Post.Type.Review,
                title="Review",
                tags=[tag_input],
            ),
            author=self.user,
        )
        assert await self.is_vote_exists_exact(review_created, tag_input)

        # Change vote
        tag_input.is_vote_positive = False
        post_input = PostTypeInput(id=review_created.id, tags=[tag_input])
        await post_update_or_create(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(review_created, tag_input)

        # Remove vote -> keeps comment
        tag_input.is_vote_positive = None
        await post_update_or_create(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(review_created, tag_input)

        # Remove vote + comment -> delete PostTagVote
        tag_input.comment = ""
        await post_update_or_create(author=self.user, data=post_input)
        assert not await self.is_vote_exists(review_created, tag_input)

        # Comment add
        tag_input.comment = "comment new"
        tag_input.is_vote_positive = UNSET
        await post_update_or_create(author=self.user, data=post_input)
        assert await self.is_vote_exists_exact(review_created, tag_input)

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

        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tags.Tool)],
                review_tags=[PostTagTypeInput(name=tags.Review, is_vote_positive=True)],
                type=Post.Type.Review,
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

        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=(await self.gen.posts.tool()).id),
                title="Review",
                type=Post.Type.Review,
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
            mutation ReviewUpdateOrCreate($data: PostTypeInput!) { post_update_or_create(data: $data) { id } }
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
        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                type=Post.Type.Review,
                tags=[PostTagTypeInput(name=tag_name_1), PostTagTypeInput(name=tag_name_2)],
            ),
        )

        # remove tag_name_1
        await post_update_or_create(
            author=self.user,
            data=PostTypeInput(id=review.id, tags=[PostTagTypeInput(name=tag_name_2)]),
        )

        # Review.tags is updated
        review_tags = {tag.name async for tag in review.tags.all()}
        assert review_tags == {tag_name_2}

        # Tool.tags is kept
        tool_tags = {tag.name async for tag in tool.tags.all()}
        assert tool_tags == {tag_name_1, tag_name_2}

    # #AI
    async def test_votes_persist_after_save_without_changes(self):
        """Bug #53: votes disappear from list after saving form without changes"""
        # Create tool with tags
        tool = await self.gen.posts.tool()
        tag_django = await self.gen.posts.tag(post=tool, name="Django")
        tag_python = await self.gen.posts.tag(post=tool, name="Python")

        # Create review with tags that have author votes
        review = await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                type=Post.Type.Review,
                title="Django Review",
                tags=[
                    PostTagTypeInput(name="Django", is_vote_positive=True),
                    PostTagTypeInput(name="Python", is_vote_positive=False),
                ],
            ),
        )

        # Query to verify votes are visible (simulating list page)
        result = await self.graphql_query(
            """
            query ReviewList {
                post_reviews(ordering: {reviewed_at: DESC}) {
                    id
                    tags {
                        name
                        votes {
                            id
                            post { id }
                            author { id }
                            is_vote_positive
                        }
                    }
                    parent {
                        id
                        tags {
                            name
                            votes {
                                id
                                post { id }
                                author { id }
                                is_vote_positive
                            }
                        }
                    }
                }
            }
            """
        )

        reviews = result.data["post_reviews"]
        review_data = next(r for r in reviews if r["id"] == str(review.id))

        # Check review.tags have votes from the author on the review
        django_tag = next(t for t in review_data["tags"] if t["name"] == "Django")

        # The bug: votes are on the tool, not the review
        # When review has tags with votes, they should be on the review, not parent
        author_vote = next(
            (
                v
                for v in django_tag["votes"]
                if v["author"]["id"] == str(self.user.id) and v["post"]["id"] == str(review.id)
            ),
            None,
        )
        assert author_vote is not None, (
            "No author vote on review. Votes are on wrong post (tool instead of review)"
        )
        assert author_vote["is_vote_positive"] is True

        # Save review without any changes
        await post_update_or_create(
            author=self.user,
            data=PostTypeInput(
                id=review.id,
                tags=[
                    PostTagTypeInput(name="Django", is_vote_positive=True),
                    PostTagTypeInput(name="Python", is_vote_positive=False),
                ],
            ),
        )

        # Query again after save
        result_after = await self.graphql_query(
            """
            query ReviewList {
                post_reviews(ordering: {reviewed_at: DESC}) {
                    id
                    tags {
                        name
                        votes {
                            id
                            post { id }
                            author { id }
                            is_vote_positive
                        }
                    }
                }
            }
            """
        )

        reviews_after = result_after.data["post_reviews"]
        review_data_after = next(r for r in reviews_after if r["id"] == str(review.id))

        # Bug: votes should still be visible but they disappear
        django_tag_after = next(t for t in review_data_after["tags"] if t["name"] == "Django")
        author_vote_after = next(
            (
                v
                for v in django_tag_after["votes"]
                if v["author"]["id"] == str(self.user.id) and v["post"]["id"] == str(review.id)
            ),
            None,
        )
        assert author_vote_after is not None, (
            "Author vote disappeared after save without changes"
        )
        assert author_vote_after["is_vote_positive"] is True
