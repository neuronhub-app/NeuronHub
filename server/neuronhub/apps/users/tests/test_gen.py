from dataclasses import dataclass

from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.users.models import User


@dataclass
class UsersGen:
    faker: UniqueProxy

    user_default: User

    _user_username = "admin"
    _user_email_domain = "neuronhub.app"
    _user_email = f"{_user_username}@{_user_email_domain}"
    _user_password = "admin"

    @classmethod
    async def create(
        cls,
        faker: UniqueProxy,
        is_user_default_superuser: bool = True,
        user_default: User | None = None,
    ):
        self = cls(
            faker=faker,
            user_default=user_default
            or await cls.get_or_create_user_default(is_superuser=is_user_default_superuser),
        )
        assert self.user_default, "UsersGen.create() failed"
        return self

    async def user(
        self,
        email: str = None,
        username: str = None,
        password: str = None,
        is_superuser: bool = False,
        first_name: str = None,
        last_name: str = None,
        is_get_or_create: bool = False,
    ) -> User:
        from neuronhub.apps.users.models import User

        username_new = username or email or self.faker.user_name()
        if is_get_or_create:
            user, _ = await User.objects.aget_or_create(
                username=username_new,
                email=f"{username_new}@{self._user_email_domain}",
            )
        else:
            user = await User.objects.acreate(
                username=username_new,
                email=email or self.faker.email(domain=self._user_email_domain),
            )
        user.first_name = first_name or self.faker.first_name()
        user.last_name = last_name or self.faker.last_name()

        if is_superuser:
            user.is_staff = True
            user.is_superuser = True

        user.set_password(password or self._user_password)
        await user.asave()
        return user

    async def get_user_default(self, is_superuser: bool = False) -> User:
        if self.user_default:
            return self.user_default
        else:
            return await self.get_or_create_user_default(is_superuser=is_superuser)

    async def alias(self, owner: User | None = None, is_get_or_create: bool = False) -> User:
        owner = owner or self.user_default

        email = f"{owner.username}-{self.faker.user_name()}@{self._user_email_domain}"
        username = f"{owner.username}-{self.faker.user_name()}"
        if is_get_or_create:
            alias, _ = await owner.aliases.aget_or_create(
                owner=owner, email=email, username=username
            )
        else:
            alias = await owner.aliases.acreate(owner=owner, email=email, username=username)
        return alias

    @classmethod
    async def get_or_create_user_default(cls, is_superuser: bool = True) -> User:
        if user_default := await User.objects.filter(
            email=cls._user_email, is_superuser=is_superuser
        ).afirst():
            return user_default
        else:
            user = await User.objects.acreate(
                email=cls._user_email,
                username=cls._user_username,
                password=cls._user_password,
            )
            if is_superuser:
                user.is_staff = True
                user.is_superuser = True
            user.set_password(cls._user_password)
            await user.asave()
            return user
