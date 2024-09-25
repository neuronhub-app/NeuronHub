from __future__ import annotations

from dataclasses import dataclass

from faker import Faker
from faker.proxy import UniqueProxy

from axonhub.apps.users.models import User


class Gen:
    users: UsersGen

    def __init__(
        self,
        is_random_values_deterministic: bool = True,
        random_seed: int = 42,
    ):
        faker = Faker()

        if is_random_values_deterministic:
            # seeding won't make every self.faker.name() return the same value
            # it'll only make the same #5 call to self.faker.name() return the same value
            faker.seed_instance(random_seed)

        # use faker.unique proxy to avoid non-unique donor emails, etc
        # beware - it might go into an infinite loop trying to return unique data if it runs out of available and
        # keeps trying to get a new unique value
        self.faker: UniqueProxy = faker.unique
        self.faker_non_unique: Faker = faker
        self.random_seeded = faker.random

        self.users = UsersGen(faker=self.faker)


@dataclass
class UsersGen:
    faker: UniqueProxy

    user_default: User = None
    user_email_local_addr = "test.bot"
    user_email_domain = "axonhub.io"
    user_email = f"{user_email_local_addr}@{user_email_domain}"

    def user(
        self,
        email: str = None,
        is_superuser: bool = False,
        first_name: str = None,
        last_name: str = None,
        is_get_or_create: bool = False,
        is_attach_org: bool = True,
    ) -> User:
        first_name = first_name or self.faker.first_name()
        if is_get_or_create:
            user, _ = User.objects.get_or_create(
                email=email or self.faker.email(domain=self.user_email_domain),
            )
        else:
            user = User.objects.create(
                email=email or self.faker.email(domain=self.user_email_domain),
            )
        user.first_name = first_name or self.faker.first_name()
        user.last_name = last_name or self.faker.last_name()

        if is_superuser:
            user.is_staff = True
            user.is_superuser = True

        user.save()

        if is_attach_org:
            pass

        return user

    def get_user_default(self, is_attach_org: bool = True) -> User:
        if not self.user_default:
            # Nylas token of the prod test user. Login in 1pass.
            self.user_default = self.user(
                email=self.user_email,
                is_get_or_create=True,
                is_attach_org=is_attach_org,
            )
        return self.user_default
