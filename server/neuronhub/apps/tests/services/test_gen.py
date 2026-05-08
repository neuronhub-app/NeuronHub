from dataclasses import dataclass

import strawberry
from django.db.models import Model

from neuronhub.apps.algolia.services.algolia_reindex_partial import AlgoliaChangedIds
from neuronhub.apps.algolia.services.algolia_reindex_partial import algolia_reindex_partial
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.airtable_sync_jobs import _parse_location_field
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_locations
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.tests.services.test_gen_reset import test_gen_reset
from neuronhub.apps.tests.test_gen import Gen
from neuronhub.apps.users.models import User


@strawberry.input
@dataclass
class PostsTagParams:
    # todo !! refac-name: category_and_name
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
    # todo !! refac-name: parent_title
    parent: str
    title: str
    tags: list[PostsTagParams] | None = None


@strawberry.input
@dataclass
class PostsCommentParams:
    # todo !! refac-name: parent_root_title
    parent_root: str
    content_polite: str = ""


@strawberry.input
@dataclass
class JobsJobParams:
    title: str | None = None
    org_name: str | None = None
    # todo !! refac: use JobLocation from main API
    locations: list[str] | None = None
    is_published: bool = True


@strawberry.input
@dataclass
class PostsImportHnParams:
    id_external: int


@strawberry.input
@dataclass
class ProfilesProfileParams:
    first_name: str = ""
    is_user_default: bool = False  # attach to default user -> needed for Algolia index


@strawberry.input
@dataclass
class ProfilesMatchParams:
    profile_first_name: str
    score_by_user: int | None = None
    score_by_llm: int | None = None


@strawberry.input
@dataclass
class GenCreateParams:
    posts_tool: PostsToolParams | None = None
    posts_review: PostsReviewParams | None = None
    posts_comment: PostsCommentParams | None = None
    posts_import_hn: PostsImportHnParams | None = None
    jobs_job: JobsJobParams | None = None
    profiles_profile: ProfilesProfileParams | None = None
    profiles_match: ProfilesMatchParams | None = None


async def test_reset_and_gen(create_params: list[GenCreateParams]) -> None:
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
    if tool_raw := create_params.posts_tool:
        tool = await gen.posts.tool(title=tool_raw.title)
        await _add_tags(tool, tool_raw.tags, author=gen.users.user_default)
        ids_per_model.setdefault(Post, []).append(tool.id)
        return

    if review_raw := create_params.posts_review:
        review = await gen.posts.review(
            tool=await Post.objects.aget(title=review_raw.parent),
            title=review_raw.title,
        )
        await _add_tags(review, review_raw.tags, author=gen.users.user_default)
        ids_per_model.setdefault(Post, []).append(review.id)
        return

    if comment_raw := create_params.posts_comment:
        comment = await gen.posts.comment(
            parent_root=await Post.objects.aget(title=comment_raw.parent_root),
            content_polite=comment_raw.content_polite,
        )
        ids_per_model.setdefault(Post, []).append(comment.id)
        return

    if hn_raw := create_params.posts_import_hn:
        importer = ImporterHackerNews(is_use_cache=True, is_logging_enabled=False)
        post = await importer.import_post(hn_raw.id_external)
        ids_per_model.setdefault(Post, []).append(post.id)
        return

    if profile_raw := create_params.profiles_profile:
        profile = await gen.profiles.profile(
            user=gen.users.user_default if profile_raw.is_user_default else None,
            first_name=profile_raw.first_name,
        )
        ids_per_model.setdefault(Profile, []).append(profile.id)
        return

    if match_raw := create_params.profiles_match:
        profile = await Profile.objects.aget(first_name=match_raw.profile_first_name)
        await gen.profiles.match(
            profile=profile,
            user=gen.users.user_default,
            score_by_user=match_raw.score_by_user,
            score_by_llm=match_raw.score_by_llm,
        )
        ids_per_model.setdefault(Profile, []).append(profile.id)
        return

    if job_raw := create_params.jobs_job:
        # todo !! refac: use gen.orgs.create()
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
            is_published=job_raw.is_published,
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
