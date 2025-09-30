from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.posts.models import Post


class TestCreatePostMutation(NeuronTestCase):
    async def test_create_tool_with_image_mutation(self):
        class post_input:
            title = "Title"
            image_content = b"content"
            image = self.gen.image(content=image_content)

        result = await self.graphql_query(
            """
            mutation PostCreate($data: PostTypeInput!) { post_update_or_create(data: $data) { id } }
            """,
            variables={"data": dict(title=post_input.title, image=post_input.image)},
        )
        assert not result.errors

        post = await Post.objects.aget(id=result.data["post_update_or_create"]["id"])
        assert post_input.title == post.title
        assert post.image.url.startswith(settings.MEDIA_URL)
        assert post_input.image_content in await sync_to_async(post.image.read)()
