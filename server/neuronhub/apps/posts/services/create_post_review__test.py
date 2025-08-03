from neuronhub.apps.posts.models import Post, PostTagVote
from neuronhub.apps.posts.services.create_post_review import create_post_review
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CreatePostReviewServiceTest(NeuronTestCase):
    async def test_tags_with_comments(self):
        tag_name = "Python"
        tag_comment = "Great language"
        data = PostTypeInput(
            parent=PostTypeInput(title="FastAPI", tool_type=Post.ToolType.Program),
            title="Modern and fast",
            tags=[
                PostTagTypeInput(
                    name=f"Dev / {tag_name}", is_vote_positive=True, comment=tag_comment
                )
            ],
        )
        review = await create_post_review(self.user, data)
        tag_vote = await PostTagVote.objects.aget(
            post=review.parent, tag__name=tag_name, author=self.user
        )
        assert tag_vote.comment == tag_comment
