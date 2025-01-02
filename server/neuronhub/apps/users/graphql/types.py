import strawberry_django

from neuronhub.apps.users.models import User


@strawberry_django.type(
    User,
    fields=[
        "id",
        "first_name",
        "last_name",
        "email",
        "org",
    ],
)
class UserType:
    pass


@strawberry_django.input(
    User,
    partial=True,
    fields=[
        "first_name",
        "last_name",
    ],
)
class UserTypeInput(UserType):
    pass
