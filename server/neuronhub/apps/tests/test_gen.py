from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import TYPE_CHECKING

from asgiref.sync import sync_to_async
from faker import Faker
from faker.proxy import UniqueProxy  # type: ignore[import]

from neuronhub.apps.anonymizer.fields import Visibility


if TYPE_CHECKING:
    from neuronhub.apps.users.models import User
    from neuronhub.apps.tools.models import Tool
    from neuronhub.apps.tools.models import ToolReview
    from neuronhub.apps.comments.models import Comment
    from neuronhub.apps.posts.models import Post


class Gen:
    users: UsersGen
    tools: ToolsGen
    comments: CommentsGen
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
        self.tools = ToolsGen(faker=self.faker, user=self.users.user_default)
        self.comments = CommentsGen(
            faker=self.faker, user=self.users.user_default, tools=self.tools
        )
        self.posts = PostsGen(faker=self.faker, user=self.users.user_default, tools=self.tools)

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
class ToolsGen:
    faker: UniqueProxy
    user: User

    async def create(
        self,
        name: str = "",
        type: str = "",
        description: str = "",
        url: str = "",
        crunchbase_url: str = "",
        github_url: str = "",
        company_name: str = None,
        company_domain: str = None,
        company_country: str = None,
        company_ownership_name: str = "Private",
        is_single_product: bool = False,
    ) -> Tool:
        from neuronhub.apps.tools.models import Tool
        from neuronhub.apps.tools.models import Company
        from neuronhub.apps.db.services.db_stubs_repopulate import create_company_ownership

        company = None
        if company_name:
            ownership = await create_company_ownership(company_ownership_name)
            company, _ = await Company.objects.aget_or_create(
                name=company_name,
                defaults={
                    "domain": company_domain or self.faker.domain_name(),
                    "country": company_country or self.faker.country_code(),
                    "ownership": ownership,
                    "is_single_product": is_single_product,
                },
            )

        tool, _ = await Tool.objects.aget_or_create(
            name=name or self.faker.company(),
            defaults={
                "type": type or "Software",
                "description": description or self.faker.text(),
                "url": url or self.faker.url(),
                "crunchbase_url": crunchbase_url,
                "github_url": github_url,
                "company": company,
            },
        )
        return tool

    async def create_review(
        self,
        tool: Tool = None,
        title: str = None,
    ) -> ToolReview:
        from neuronhub.apps.tools.models import ToolReview

        return await ToolReview.objects.acreate(
            tool=tool or await self.create(),
            title=title or self.faker.text(),
            author=self.user,
        )


@dataclass
class CommentsGen:
    faker: UniqueProxy
    user: User

    tools: ToolsGen

    async def create(
        self,
        review: ToolReview = None,
        author: User = None,
        visibility: Visibility = Visibility.INTERNAL,
        visible_to_users: list[User] = None,
    ) -> Comment:
        from neuronhub.apps.comments.models import Comment

        comment = await Comment.objects.acreate(
            content_object=review or await self.tools.create_review(),
            author=author or self.user,
            content=self.faker.text(),
            visibility=visibility,
        )
        if visible_to_users:
            await sync_to_async(comment.visible_to_users.set)(visible_to_users)

        return comment


@dataclass
class PostsGen:
    faker: UniqueProxy
    user: User
    tools: ToolsGen

    async def create(
        self,
        title: str,
        content: str = "",
        tool: Tool = None,
        author: User = None,
        visibility: Visibility = Visibility.PUBLIC,
    ) -> Post:
        from neuronhub.apps.posts.models import Post

        post = await Post.objects.acreate(
            title=title,
            content=content or self.faker.text(max_nb_chars=500),
            author=author or self.user,
            tool=tool,
            visibility=visibility,
        )
        return post
