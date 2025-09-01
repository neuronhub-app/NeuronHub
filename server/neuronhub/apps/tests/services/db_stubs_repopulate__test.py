from neuronhub.apps.tests.services.db_stubs_repopulate import (
    db_stubs_repopulate,
    _create_review_tags,
    ReviewTagParams,
)
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.tests.test_cases import NeuronTestCase


class DbStubsRepopulateTest(NeuronTestCase):
    async def test_repopulate(self):
        await db_stubs_repopulate()
        assert await Post.reviews.all().afirst()

    # AI
    async def test_creates_review_tags_only_if_a_vote_is_present(self):
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
        ]

        # Create review tags
        await _create_review_tags(review, review_tag_params)

        # Only tags with actual votes (True/False) should be created
        created_tags = [tag async for tag in review.review_tags.filter(is_review_tag=True)]
        created_tag_names = {tag.name for tag in created_tags}

        # We expect only 2 tags (those with True/False votes)
        expected_tag_names = {
            ReviewTagName.ease_of_use.value,
            ReviewTagName.stability.value,
        }

        assert created_tag_names == expected_tag_names, (
            f"Expected only tags with votes {expected_tag_names}, but got {created_tag_names}"
        )
