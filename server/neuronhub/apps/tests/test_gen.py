from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import TYPE_CHECKING

from faker import Faker
from faker.proxy import UniqueProxy


if TYPE_CHECKING:
    from neuronhub.apps.users.models import User


class Gen:
    users: UsersGen
    faker: UniqueProxy
    faker_non_unique: Faker

    @classmethod
    async def create(
        cls,
        is_random_values_deterministic: bool = True,
        random_seed: int = 42,
    ):
        self = cls()

        faker = Faker()

        if is_random_values_deterministic:
            # seeding won't make every self.faker.name() return the same value
            # it'll only make the same #5 call to self.faker.name() return the same value
            faker.seed_instance(random_seed)

        # use faker.unique proxy to avoid non-unique donor emails, etc
        # beware - it might go into an infinite loop trying to return unique data if it runs out of available and
        # keeps trying to get a new unique value
        self.faker = faker.unique
        self.faker_non_unique = faker
        self.random_seeded = faker.random

        self.users = await UsersGen.create(faker=self.faker)

        return self


@dataclass
class UsersGen:
    faker: UniqueProxy

    user_default: User = None
    user_default_task: asyncio.Task = None
    user_email_local_addr = "test.bot"
    user_email_domain = "neuronhub.io"
    user_email = f"{user_email_local_addr}@{user_email_domain}"

    @classmethod
    async def create(cls, faker: UniqueProxy):
        self = cls(faker=faker)
        self.user_default = await self.get_user_default()
        return self

    async def user(
        self,
        email: str = None,
        is_superuser: bool = False,
        first_name: str = None,
        last_name: str = None,
        is_get_or_create: bool = False,
        is_attach_org: bool = True,
    ) -> User:
        from neuronhub.apps.users.models import User

        first_name = first_name or self.faker.first_name()
        if is_get_or_create:
            user, _ = await User.objects.aget_or_create(
                email=email or self.faker.email(domain=self.user_email_domain),
            )
        else:
            user = await User.objects.acreate(
                email=email or self.faker.email(domain=self.user_email_domain),
            )
        user.first_name = first_name or self.faker.first_name()
        user.last_name = last_name or self.faker.last_name()

        if is_superuser:
            user.is_staff = True
            user.is_superuser = True

        await user.asave()

        if is_attach_org:
            pass

        return user

    async def get_user_default(self, is_attach_org: bool = True) -> User:
        from neuronhub.apps.users.models import User

        if self.user_default:
            return self.user_default
        else:
            if user_default := await User.objects.filter(email="admin@localhost").afirst():
                return user_default
            else:
                return await self.user(
                    email=self.user_email,
                    is_get_or_create=True,
                    is_attach_org=is_attach_org,
                )
