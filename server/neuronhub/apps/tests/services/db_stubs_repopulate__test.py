from neuronhub.apps.tests.services.db_stubs_repopulate import (
    db_stubs_repopulate,
    _create_review_tags,
    ReviewTagParams,
)
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.graphql.types_lazy import ReviewTagName
from neuronhub.apps.tests.test_cases import NeuronTestCase


class DbStubsRepopulateTest(NeuronTestCase):
    async def test_db_stubs_repopulate(self):
        await db_stubs_repopulate()
        assert await Post.reviews.all().afirst()

    async def test_review_tags_creation(self):
        review = await self.gen.posts.review()
        await _create_review_tags(
            review,
            [
                ReviewTagParams(name=ReviewTagName.ease_of_use, is_vote_pos=True),
                ReviewTagParams(name=ReviewTagName.stability, is_vote_pos=False),
            ],
        )
        review_tags = [tag async for tag in review.review_tags.filter(is_review_tag=True)]
        assert {ReviewTagName.ease_of_use.value, ReviewTagName.stability.value} == {
            tag.name for tag in review_tags
        }
