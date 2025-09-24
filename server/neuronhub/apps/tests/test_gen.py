from __future__ import annotations

from dataclasses import dataclass
from random import Random

from asgiref.sync import sync_to_async
from django.core.files.uploadedfile import SimpleUploadedFile
from faker import Faker
from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.anonymizer.fields import Visibility

from neuronhub.apps.users.models import User
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models.types import PostTypeEnum


class Gen:
    users: UsersGen
    posts: PostsGen
    faker: UniqueProxy
    faker_non_unique: Faker
    random_gen_seeded: Random

    # todo refac: rename to `new`? `create` sounds as we'll call User.objects.create(), not get_or_create()
    @classmethod
    async def create(
        cls,
        is_user_default_superuser: bool = True,
    ):
        self = cls()

        faker = Faker()
        self.faker = faker.unique  # faker.unique to avoid non-unique usernames, etc

        faker.seed_instance(42)  # Deterministic: #5 faker.name() -> same #5 name() string
        self.random_gen_seeded = faker.random
        self.faker_non_unique = faker

        self.users = await UsersGen.create(
            faker=self.faker,
            is_user_default_superuser=is_user_default_superuser,
        )
        self.posts = PostsGen(faker=self.faker, user=self.users.user_default)

        return self

    def image(self, content=b"image_content") -> SimpleUploadedFile:
        return SimpleUploadedFile(name="image.jpg", content=content, content_type="image/jpeg")


@dataclass
class UsersGen:
    faker: UniqueProxy

    user_default: User

    _user_username = "admin"
    _user_email_domain = "neuronhub.io"
    _user_email = f"{_user_username}@{_user_email_domain}"
    _user_password = "admin"

    @classmethod
    async def create(cls, faker: UniqueProxy, is_user_default_superuser: bool = True):
        self = cls(
            faker=faker,
            user_default=await cls.get_or_create_user_default(
                is_superuser=is_user_default_superuser
            ),
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
        is_attach_org: bool = True,
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


@dataclass
class PostsGen:
    faker: UniqueProxy
    user: User

    @dataclass
    class Params:
        type: PostTypeEnum = Post.Type.Post
        parent: Post | None = None
        title: str = ""
        content: str = ""
        author: User | None = None
        visibility: Visibility = Visibility.PUBLIC
        visible_to_users: list[User] | None = None

        # tools
        # ------
        tool_type: Post.ToolType = Post.ToolType.Program
        url: str = ""
        crunchbase_url: str = ""
        github_url: str = ""
        company_name: str | None = None
        company_domain: str | None = None
        company_country: str | None = None
        company_ownership_name: str = "Private"
        is_single_product: bool = False

    async def comment(
        self,
        parent: Post = None,
        author: User = None,
        visibility: Visibility = Visibility.PUBLIC,
        visible_to_users: list[User] = None,
    ) -> Post:
        return await self.create(
            self.Params(
                parent=parent,
                type=Post.Type.Comment,
                author=author or self.user,
                visibility=visibility,
                visible_to_users=visible_to_users,
            )
        )

    async def tool(self, author: User = None) -> Post:
        return await self.create(self.Params(type=Post.Type.Tool, author=author or self.user))

    async def review(self, author: User = None) -> Post:
        return await self.create(
            self.Params(
                type=Post.Type.Review,
                author=author or self.user,
                parent=await self.create(self.Params(type=Post.Type.Tool)),
            )
        )

    async def vote(
        self,
        post: Post,
        author: User = None,
        is_vote_positive: bool = True,
    ):
        from neuronhub.apps.posts.models import PostVote

        return await PostVote.objects.acreate(
            post=post,
            author=author or self.user,
            is_vote_positive=is_vote_positive,
        )

    async def tag(
        self,
        name: str = None,
        post: Post = None,
        author: User = None,
        is_important: bool = False,
    ):
        from neuronhub.apps.posts.models import PostTag

        tag = await PostTag.objects.acreate(
            name=name or self.faker.word(),
            author=author or self.user,
            is_important=is_important,
        )
        if post:
            await post.tags.aadd(tag)
        return tag

    # todo refac-rename: `post`
    async def create(self, params: Params = Params(type=Post.Type.Post)) -> Post:
        from neuronhub.apps.posts.models import Post
        from neuronhub.apps.posts.models import ToolCompany
        from neuronhub.apps.tests.services.db_stubs_repopulate import create_company_ownership

        company = None
        if params.company_name:
            ownership = await create_company_ownership(params.company_ownership_name)
            company, _ = await ToolCompany.objects.aget_or_create(
                name=params.company_name,
                defaults=dict(
                    domain=params.company_domain or self.faker.domain_name(),
                    country=params.company_country or self.faker.country_code(),
                    ownership=ownership,
                    is_single_product=params.is_single_product,
                ),
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


PostParams = PostsGen.Params
