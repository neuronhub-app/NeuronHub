from dataclasses import dataclass

import strawberry

from neuronhub.apps.algolia.services.algolia_reindex_partial import AlgoliaChangedIds
from neuronhub.apps.algolia.services.algolia_reindex_partial import algolia_reindex_partial
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_gen import Gen


@strawberry.input
@dataclass
class PostsToolParams:
    title: str


@strawberry.input
@dataclass
class PostsReviewParams:
    parent: str
    title: str


@strawberry.input
@dataclass
class GenCreateParams:
    posts_tool: PostsToolParams | None = None
    posts_review: PostsReviewParams | None = None


async def test_gen(create_params: list[GenCreateParams]) -> None:
    gen = await Gen.create(is_user_default_superuser=True)
    with disable_auto_indexing_if_enabled():
        posts_ids_created: list[int] = []
        for params in create_params:
            if post := await _create_post(gen, params):
                posts_ids_created.append(post.id)

    await algolia_reindex_partial(
        AlgoliaChangedIds(model=Post, created=posts_ids_created),
        is_wait_for_tasks=True,
    )


async def _create_post(gen: Gen, create_params: GenCreateParams) -> Post | None:
    if posts_tool := create_params.posts_tool:
        return await gen.posts.create(
            gen.posts.Params(type=Post.Type.Tool, title=posts_tool.title)
        )

    if posts_review := create_params.posts_review:
        return await gen.posts.create(
            gen.posts.Params(
                parent=await Post.objects.aget(title=posts_review.parent, type=Post.Type.Tool),
                type=Post.Type.Review,
                title=posts_review.title,
            )
        )

    raise ValueError(f"Add params to GenCreateParams: {create_params}")
