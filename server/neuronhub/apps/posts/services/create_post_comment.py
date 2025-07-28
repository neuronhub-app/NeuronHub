from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import Visibility
from neuronhub.apps.users.models import User


async def create_post_comment(
    author: User,
    parent: Post,
    content: str,
    visibility: Visibility = Visibility.PUBLIC,
    visible_to_users: list[User] | None = None,
    visible_to_groups: list | None = None,
) -> Post:
    comment = await Post.objects.acreate(
        type=Post.Type.Comment,
        author=author,
        parent=parent,
        content=content,
        visibility=visibility,
    )

    if visible_to_users:
        await comment.visible_to_users.aset(visible_to_users)
    if visible_to_groups:
        await comment.visible_to_groups.aset(visible_to_groups)

    return comment
