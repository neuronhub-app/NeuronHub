from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.create_post_comment import create_post_comment
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestCreatePostComment(NeuronTestCase):
    async def test_create_comment_sets_correct_type(self):
        # Arrange
        post = await self.gen.posts.create()
        content_test = "Test comment content"

        # Act
        comment = await create_post_comment(
            author=self.user,
            parent=post,
            content=content_test,
        )

        # Assert
        assert comment.type == Post.Type.Comment
        assert comment.content == content_test
        assert comment.parent_id == post.id
        assert comment.author_id == self.user.id
