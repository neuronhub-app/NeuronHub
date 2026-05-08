from dataclasses import dataclass

import strawberry
from django.db.models import Model

from neuronhub.apps.algolia.services.algolia_reindex_partial import AlgoliaChangedIds
from neuronhub.apps.algolia.services.algolia_reindex_partial import algolia_reindex_partial
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.airtable_sync_jobs import _parse_location_field
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_locations
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update
from neuronhub.apps.tests.services.test_gen_reset import test_gen_reset
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.models import User


@strawberry.input
@dataclass
class PostsTagParams:
    name: str  # supports "Category / Tag" parsing
    is_vote_pos: bool | None = None
    is_important: bool | None = None


@strawberry.input
@dataclass
class PostsToolParams:
    title: str
    tags: list[PostsTagParams] | None = None


@strawberry.input
@dataclass
class PostsReviewParams:
    parent: str
    title: str
    tags: list[PostsTagParams] | None = None


@strawberry.input
@dataclass
class JobsJobParams:
    title: str
    org_name: str | None = None
    locations: list[str] | None = None


@strawberry.input
@dataclass
class GenCreateParams:
    posts_tool: PostsToolParams | None = None
    posts_review: PostsReviewParams | None = None
    jobs_job: JobsJobParams | None = None


async def test_gen(create_params: list[GenCreateParams]) -> None:
    await test_gen_reset()
    gen = await Gen.create(is_user_default_superuser=True)
    ids_per_model: dict[type[Model], list[int]] = {}
    with disable_auto_indexing_if_enabled():
        for params in create_params:
            await _create(gen, params, ids_per_model=ids_per_model)

    await algolia_reindex_partial(
        *[AlgoliaChangedIds(model=m, created=ids) for m, ids in ids_per_model.items()],
        is_wait_for_tasks=True,
    )


async def _create(
    gen: Gen,
    create_params: GenCreateParams,
    ids_per_model: dict[type[Model], list[int]],
) -> None:
    user = gen.users.user_default

    if tool_raw := create_params.posts_tool:
        post = await gen.posts.create(
            gen.posts.Params(type=Post.Type.Tool, title=tool_raw.title)
        )
        await _add_tags(post, tool_raw.tags, author=user)
        ids_per_model.setdefault(Post, []).append(post.id)
        return

    if review_raw := create_params.posts_review:
        post = await gen.posts.create(
            gen.posts.Params(
                parent=await Post.objects.aget(title=review_raw.parent, type=Post.Type.Tool),
                type=Post.Type.Review,
                title=review_raw.title,
            )
        )
        await _add_tags(post, review_raw.tags, author=user)
        ids_per_model.setdefault(Post, []).append(post.id)
        return

    if job_raw := create_params.jobs_job:
        org = None
        if job_raw.org_name:
            org, _ = await Org.objects.aget_or_create(name=job_raw.org_name)
        locations = await _sync_locations(
            _parse_location_field(", ".join(f'"{name}"' for name in job_raw.locations or []))
        )
        job = await gen.jobs.job(
            org=org,
            title=job_raw.title,
            locations=locations,
            is_published=True,
        )
        ids_per_model.setdefault(Job, []).append(job.id)
        return

    raise ValueError(f"Missing handler in GenCreateParams: {create_params}")


async def _add_tags(post: Post, params: list[PostsTagParams] | None, author: User) -> None:
    for param in params or []:
        tag = await tag_create_or_update(
            name_raw=param.name,
            post=post,
            author=author,
            is_vote_positive=param.is_vote_pos,
            is_important=param.is_important,
        )
        await post.tags.aadd(tag)
