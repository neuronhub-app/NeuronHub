from typing import cast

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q, Exists, OuterRef
from django.db.models import QuerySet

from neuronhub.apps.anonymizer.fields import Visibility

from neuronhub.apps.posts.models import Post
from neuronhub.apps.users.models import User


async def filter_posts_by_user(
    user: AbstractUser | AnonymousUser | AbstractBaseUser,
    posts: QuerySet[Post] | None = None,
) -> QuerySet[Post]:
    """
    Used in [[PostTypeI#get_queryset]] - ie globally in GraphQL.

    FYI: Using Exists() because Q() leads to post-JOIN duplicates.
    """
    if posts is None:
        posts = Post.objects.all()

    if user.is_authenticated:
        user = cast(User, user)

        is_own_post = Q(author=user)
        is_allowed_as_a_user_selected = Exists(
            Post.objects.filter(
                pk=OuterRef("pk"), visibility=Visibility.USERS_SELECTED, visible_to_users=user
            )
        )
        is_allowed_as_a_connection_group_selected = Exists(
            Post.objects.filter(
                pk=OuterRef("pk"),
                visibility=Visibility.CONNECTION_GROUPS_SELECTED,
                visible_to_groups__connections=user,
            )
        )
        is_allowed_as_a_connection = Exists(
            Post.objects.filter(
                pk=OuterRef("pk"),
                visibility=Visibility.CONNECTIONS,
                author__connection_group__connections=user,
            )
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

    return posts
