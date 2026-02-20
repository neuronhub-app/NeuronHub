from typing import cast

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AnonymousUser
from django.db.models import Exists
from django.db.models import OuterRef
from django.db.models import Q
from django.db.models import QuerySet

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.users.models import User


# todo ! refac: dedup with [[filter_posts_by_user.py]] and [[filter_profiles_by_user.py]]
def filter_jobs_by_user(
    user: AbstractUser | AnonymousUser | AbstractBaseUser,
    jobs: QuerySet[Job] | None = None,
) -> QuerySet[Job]:
    if jobs is None:
        jobs = Job.objects.all()

    if user.is_authenticated:
        user = cast(User, user)

        is_own_profile = Q(author=user)
        is_allowed_as_user_selected = Exists(
            Job.objects.filter(
                pk=OuterRef("pk"), visibility=Visibility.USERS_SELECTED, visible_to_users=user
            )
        )
        is_allowed_as_connection = Exists(
            Job.objects.filter(
                pk=OuterRef("pk"),
                visibility=Visibility.CONNECTIONS,
                author__connection_group__connections=user,
            )
        )
        is_publicly_visible = Q(visibility__in=[Visibility.INTERNAL, Visibility.PUBLIC])

        jobs = jobs.filter(
            is_own_profile
            | is_allowed_as_user_selected
            | is_allowed_as_connection
            | is_publicly_visible
        )
    else:
        jobs = jobs.filter(visibility=Visibility.PUBLIC)

    return jobs
