from neuronhub.apps.db.services.db_stubs_repopulate import (
    db_stubs_repopulate,
    create_review_tags,
    ReviewTagParams,
)
from neuronhub.apps.posts.models import Post, PostTag
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.tests.test_cases import NeuronTestCase


class DbStubsRepopulateTest(NeuronTestCase):
    async def test_repopulate(self):
        await db_stubs_repopulate()
        assert await Post.reviews.all().afirst()

    async def test_create_review_tags_bug(self):
        """Test that demonstrates the bug in create_review_tags function.

        This test should FAIL initially, showing that all review tags
        are created as 'expectations' instead of their intended names.
        """
        # Arrange: Create a review post
        review = await self.gen.posts.create(
            self.gen.posts.Params(
                type=Post.Type.Review,
                title="Test Review",
                content="Test content",
            )
        )

        # Define different review tag parameters
        review_tag_params = [
            ReviewTagParams(name=ReviewTagName.value, is_vote_pos=True),
            ReviewTagParams(name=ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(name=ReviewTagName.ease_of_use, is_vote_pos=True),
        ]

        # Act: Create review tags using the buggy function
        await create_review_tags(review, review_tag_params)

        # Assert: This should fail because all tags are created as "expectations"
        # instead of their intended names
        created_tags = [tag async for tag in PostTag.objects.filter(is_review_tag=True)]
        created_tag_names = {tag.name for tag in created_tags}

        # What we expect (this should fail due to the bug)
        expected_tag_names = {
            ReviewTagName.value.value,
            ReviewTagName.stability.value,
            ReviewTagName.ease_of_use.value,
        }

        # This assertion will fail, demonstrating the bug
        assert created_tag_names == expected_tag_names, (
            f"Expected {expected_tag_names}, but got {created_tag_names}"
        )

    async def test_review_tags_require_votes(self):
        """Test that review tags should only be created when is_vote_pos is not None"""
        # Create a review
        review = await self.gen.posts.create(
            self.gen.posts.Params(
                type=Post.Type.Review,
                title="Test Review No Votes",
                content="Testing tags without votes",
            )
        )

        # Define review tags with mixed vote values
        review_tag_params = [
            ReviewTagParams(name=ReviewTagName.ease_of_use, is_vote_pos=True),
            ReviewTagParams(name=ReviewTagName.stability, is_vote_pos=False),
            ReviewTagParams(name=ReviewTagName.value, is_vote_pos=None),  # Should NOT create tag
            ReviewTagParams(
                name=ReviewTagName.a_must_have, is_vote_pos=None
            ),  # Should NOT create tag
        ]

        # Create review tags
        await create_review_tags(review, review_tag_params)

        # Only tags with actual votes (True/False) should be created
        created_tags = [tag async for tag in review.tags.filter(is_review_tag=True)]
        created_tag_names = {tag.name for tag in created_tags}

        # We expect only 2 tags (those with True/False votes)
        expected_tag_names = {
            ReviewTagName.ease_of_use.value,
            ReviewTagName.stability.value,
        }

        assert created_tag_names == expected_tag_names, (
            f"Expected only tags with votes {expected_tag_names}, but got {created_tag_names}"
        )
