from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.db.models import QuerySet

from neuronhub.apps.anonymizer.fields import Visibility

from neuronhub.apps.posts.models import Post


async def filter_posts_by_user(
    user: AbstractUser | AnonymousUser,
    posts: QuerySet[Post] | QuerySet[Post, Post] = None,
) -> QuerySet[Post]:
    """
    Used in [[PostTypeI#get_queryset]] - ie globally in GraphQL.
    """
    if posts is None:
        posts = Post.objects.all()

    if user.is_authenticated:
        is_own_post = Q(author=user)
        is_allowed_as_a_user_selected = Q(
            visibility=Visibility.USERS_SELECTED,
            visible_to_users__in=[user],
        )
        is_allowed_as_a_connection_group_selected = Q(
            visibility=Visibility.CONNECTION_GROUPS_SELECTED,
            visible_to_groups__connections__in=[user],
        )
        is_allowed_as_a_connection = Q(
            visibility=Visibility.CONNECTIONS,
            # [for AI] it must be `connection_group`
            author__connection_group__connections__in=[user],
        )
        is_publicly_visible = Q(visibility__in=[Visibility.INTERNAL, Visibility.PUBLIC])

        posts = posts.filter(
            is_own_post
            | is_allowed_as_a_user_selected
            | is_allowed_as_a_connection_group_selected
            | is_allowed_as_a_connection
            | is_publicly_visible
        )
    else:
        posts = posts.filter(visibility=Visibility.PUBLIC)

    posts = posts.prefetch_related("parent", "author")
    return posts
