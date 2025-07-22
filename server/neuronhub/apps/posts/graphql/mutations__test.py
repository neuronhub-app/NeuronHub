from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestCreatePostComment(NeuronTestCase):
    async def test_create_comment_sets_correct_type(self):
        post = await self.gen.posts.create()

        content_test = "Test comment content"
        result = await self.graphql_query(
            """
                mutation CreateComment($data: PostTypeInput!) {
                    create_post_comment(data: $data) {
                        id
                        type
                        content
                        parent {
                            id
                        }
                    }
                }
            """,
            {
                "data": {
                    "parent": {"id": post.id},
                    "content": content_test,
                    "visibility": "PUBLIC",
                }
            },
        )

        comment_data = result.data["create_post_comment"]
        assert comment_data["content"] == content_test
        assert comment_data["parent"]["id"] == str(post.id)

        comment = await Post.objects.aget(id=comment_data["id"])
        assert comment.type == Post.Type.Comment
