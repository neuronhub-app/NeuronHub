from neuronhub.apps.posts.models import Post, PostTagVote, PostTag
from neuronhub.apps.posts.services.create_post_review import create_post_review
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CreatePostReviewTest(NeuronTestCase):
    async def test_tags_with_comments(self):
        tag_name = "Python"
        tag_comment = "comment"

        tool = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Tool))
        review = await create_post_review(
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
        tag_vote = await PostTagVote.objects.aget(
            post=review.parent, tag__name=tag_name, author=self.user
        )
        assert tag_vote.comment == tag_comment
        assert tag_vote.is_vote_positive

    async def test_tags_creation_is_important(self):
        tool = await self.gen.posts.create(self.gen.posts.Params(type=Post.Type.Tool))
        tag_name_1 = "Python"
        await create_post_review(
            author=self.user,
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=f"Dev / {tag_name_1}", is_important=True)],
            ),
        )
        tag = await PostTag.objects.aget(name=tag_name_1, author=self.user)
        assert tag.is_important

        # assert is_important can't be set by non-author
        tag_name_2 = "Rust"
        tag = await self.gen.posts.tag(f"Dev / {tag_name_2}")
        await create_post_review(
            author=await self.gen.users.user(),
            data=PostTypeInput(
                parent=PostTypeInput(id=tool.id),
                title="Review",
                tags=[PostTagTypeInput(name=tag.name, is_important=True)],
            ),
        )
        await tag.arefresh_from_db()
        assert not tag.is_important
