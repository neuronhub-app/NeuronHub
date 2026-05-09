from dataclasses import dataclass

from asgiref.sync import sync_to_async
from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostCategory
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory
from neuronhub.apps.posts.models import PostVote
from neuronhub.apps.posts.models.types import PostTypeEnum
from neuronhub.apps.users.models import User


@dataclass
class PostsGen:
    faker: UniqueProxy
    user: User

    @dataclass
    class Params:
        type: PostTypeEnum = Post.Type.Post
        parent: Post | None = None
        parent_root: Post | None = None
        title: str | None = ""
        content_polite: str = ""
        content_direct: str = ""
        content_rant: str = ""
        author: User | None = None
        visibility: Visibility = Visibility.PUBLIC
        visible_to_users: list[User] | None = None
        category: PostCategory | None = None

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
        parent_root: Post,
        parent: Post = None,
        author: User = None,
        content_polite: str = "",
        visibility: Visibility = Visibility.PUBLIC,
        visible_to_users: list[User] = None,
    ) -> Post:
        if not parent:
            parent = parent_root

        return await self.create(
            self.Params(
                parent=parent or parent_root,
                parent_root=parent_root,
                type=Post.Type.Comment,
                author=author or self.user,
                content_polite=content_polite,
                visibility=visibility,
                visible_to_users=visible_to_users,
            )
        )

    async def post(self, title: str = None) -> Post:
        return await self.create(self.Params(title=title))

    async def tool(self, title: str = None, visibility=Visibility.PUBLIC) -> Post:
        return await self.create(
            self.Params(
                title=title,
                type=Post.Type.Tool,
                author=self.user,
                visibility=visibility,
            )
        )

    async def review(self, tool: Post = None, title: str = None, author: User = None) -> Post:
        return await self.create(
            self.Params(
                title=title,
                type=Post.Type.Review,
                author=author or self.user,
                parent=tool or await self.tool(),
            )
        )

    async def vote(
        self,
        post: Post,
        author: User = None,
        is_vote_positive: bool = True,
    ):

        vote, _ = await PostVote.objects.aupdate_or_create(
            post=post,
            author=author or self.user,
            defaults=dict(is_vote_positive=is_vote_positive),
        )
        return vote

    async def tag(
        self,
        name: str = None,
        category: TagCategoryEnum | None = None,
        post: Post = None,
        author: User = None,
        is_important: bool = False,
    ):
        tag, _ = await PostTag.objects.aupdate_or_create(
            name=name or self.faker.word(),
            defaults=dict(author=author or self.user, is_important=is_important),
        )
        if category:
            cat, _ = await PostTagCategory.objects.aget_or_create(name=category)
            await tag.categories.aadd(cat)
        if post:
            await post.tags.aadd(tag)
        return tag

    # todo refac-rename: `_update_or_create`
    async def create(self, params: Params = Params()) -> Post:
        from neuronhub.apps.posts.models import Post
        from neuronhub.apps.posts.models import ToolCompany
        from neuronhub.apps.posts.tests.db_stubs import create_company_ownership

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

        title = params.title or self.faker.sentence()

        # todo !! fix: use .create()
        post, _ = await Post.objects.aupdate_or_create(
            title=title,
            type=params.type,
            defaults=dict(
                parent=params.parent,
                parent_root=params.parent_root,
                content_polite=params.content_polite or self.faker.text(max_nb_chars=500),
                content_direct=params.content_direct,
                content_rant=params.content_rant,
                author=params.author or self.user,
                visibility=params.visibility,
                # tools
                # ------
                tool_type=params.tool_type,
                company=company,
                url=params.url or (self.faker.url() if params.type == Post.Type.Tool else ""),
                crunchbase_url=params.crunchbase_url,
                github_url=params.github_url,
            ),
        )

        if params.visible_to_users:
            await sync_to_async(post.visible_to_users.set)(params.visible_to_users)

        return post


PostParams = PostsGen.Params
