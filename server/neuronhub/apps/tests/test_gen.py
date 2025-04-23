from __future__ import annotations

import asyncio
from dataclasses import dataclass

from asgiref.sync import sync_to_async
from faker import Faker
from faker.proxy import UniqueProxy  # type: ignore[import]

from neuronhub.apps.anonymizer.fields import Visibility

from neuronhub.apps.users.models import User
from neuronhub.apps.posts.models import Post


class Gen:
    users: UsersGen
    posts: PostsGen
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
        self.posts = PostsGen(faker=self.faker, user=self.users.user_default)

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
                username=email or self.faker.user_name(),
                email=email or self.faker.email(domain=self.user_email_domain),
            )
        else:
            user = await User.objects.acreate(
                username=email or self.faker.user_name(),
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
            if user_default := await User.objects.filter(email=self.user_email).afirst():
                return user_default
            else:
                return await self.user(
                    email=self.user_email,
                    is_get_or_create=True,
                    is_attach_org=is_attach_org,
                )


@dataclass
class PostsGen:
    faker: UniqueProxy
    user: User

    @dataclass
    class Params:
        type: Post.Type = Post.Type.Post
        parent: Post = None
        title: str = ""
        content: str = ""
        author: User = None
        visibility: Visibility = Visibility.PUBLIC
        visible_to_users: list[User] = None
        # tools
        # ------
        tool_type: Post.ToolType = Post.ToolType.Program
        url: str = ""
        crunchbase_url: str = ""
        github_url: str = ""
        company_name: str = None
        company_domain: str = None
        company_country: str = None
        company_ownership_name: str = "Private"
        is_single_product: bool = False

    async def comment(
        self,
        post: Post = None,
        author: User = None,
        visibility: Visibility = Visibility.PUBLIC,
        visible_to_users: list[User] = None,
    ) -> Post:
        return await self.create(
            self.Params(
                parent=post,
                type=Post.Type.Comment,
                author=author or self.user,
                visibility=visibility,
                visible_to_users=visible_to_users,
            )
        )

    async def create(self, params: Params = Params()) -> Post:
        from neuronhub.apps.posts.models import Post
        from neuronhub.apps.posts.models import ToolCompany
        from neuronhub.apps.db.services.db_stubs_repopulate import create_company_ownership

        company = None
        if params.company_name:
            ownership = await create_company_ownership(params.company_ownership_name)
            company = await ToolCompany.objects.acreate(
                name=params.company_name,
                domain=params.company_domain or self.faker.domain_name(),
                country=params.company_country or self.faker.country_code(),
                ownership=ownership,
                is_single_product=params.is_single_product,
            )

        is_tool = params.type == Post.Type.Tool
        post = await Post.objects.acreate(
            type=params.type,
            parent=params.parent,
            title=params.title or self.faker.sentence(),
            content=params.content or self.faker.text(max_nb_chars=500),
            author=params.author or self.user,
            visibility=params.visibility,
            # tools
            # ------
            tool_type=params.tool_type,
            company=company,
            url=params.url or (self.faker.url() if is_tool else ""),
            crunchbase_url=params.crunchbase_url,
            github_url=params.github_url,
        )

        if params.visible_to_users:
            await sync_to_async(post.visible_to_users.set)(params.visible_to_users)

        return post
