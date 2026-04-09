import uuid
from typing import cast

import sentry_sdk
import strawberry
import strawberry_django
from asgiref.sync import sync_to_async
from django.conf import settings
from django.db.models import Count
from django.db.models import Q
from django.db.models import QuerySet
from strawberry import auto
from strawberry_django.permissions import IsAuthenticated
from strawberry_django.permissions import IsStaff

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobFaqQuestion
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services.filter_jobs_by_user import filter_jobs_by_user
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alert_confirmation_email
from neuronhub.apps.jobs.services.serialize_to_md import serialize_job_to_markdown
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.sites.graphql import get_list_cached
from neuronhub.apps.users.graphql.resolvers import get_user
from neuronhub.apps.users.graphql.resolvers import get_user_maybe
from neuronhub.apps.users.graphql.resolvers import get_user_sync
from neuronhub.apps.users.models import User


@strawberry_django.type(JobLocation)
class JobLocationType:
    id: auto
    name: auto
    type: auto
    city: auto
    country: auto
    region: auto
    is_remote: auto
    remote_name: auto
    algolia_filter_name: auto
    job_count: int = 0  # #AI-slop from annotate() below


@strawberry_django.type(JobFaqQuestion)
class JobFaqQuestionType:
    id: auto
    question: auto
    answer_md: auto
    order: auto


@strawberry_django.type(Org)
class OrgType:
    id: auto
    name: auto
    website: auto
    website_with_utm: auto
    jobs_page_url: auto
    is_highlighted: auto
    logo: auto
    description: auto
    tags_area: list[PostTagType]


@strawberry_django.filter_type(Job, lookups=True)
class JobFilter:
    id: auto


@strawberry_django.type(Job, filters=JobFilter)
class JobType:
    org: OrgType

    id: auto
    title: auto
    slug: auto
    description: auto

    salary_min: auto
    salary_text: auto

    locations: list[JobLocationType]

    source_ext: auto

    url_external: auto
    url_external_with_utm: auto
    is_published: auto

    posted_at: auto
    closes_at: auto

    tags_skill: list[PostTagType]
    tags_area: list[PostTagType]
    tags_education: list[PostTagType]
    tags_experience: list[PostTagType]
    tags_workload: list[PostTagType]

    has_salary: auto
    is_orgs_highlighted: auto
    is_not_career_capital: auto
    is_not_profit_for_good: auto

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Job], info: strawberry.Info) -> QuerySet[Job]:
        user = get_user_sync(info)
        return filter_jobs_by_user(user, jobs=queryset.filter(is_published=True))


@strawberry_django.type(JobAlert)
class JobAlertType:
    id: auto
    id_ext: auto
    email: auto
    tags: list[PostTagType]
    locations: list[JobLocationType]
    is_orgs_highlighted: auto
    is_remote: auto = strawberry.field(
        deprecation_reason=".is_remote was moved to JobLocation.is_remote"
    )
    salary_min: auto
    is_exclude_no_salary: auto
    is_exclude_career_capital: auto
    is_exclude_profit_for_good: auto
    is_active: auto
    created_at: auto
    sent_count: auto


@strawberry.type
class JobVersionType:
    id: strawberry.ID
    draft_markdown: str
    published_markdown: str
    draft: JobType
    published: JobType


@strawberry.type(name="Query")
class JobsQuery:
    jobs: list[JobType] = strawberry_django.field()

    class CacheKey:
        Faq = "JobFaqQuestions"
        Locations = "JobLocations"

    @strawberry_django.field
    async def job_locations(self) -> list[JobLocationType]:
        cached = await settings.CACHE_RAM.aget(JobsQuery.CacheKey.Locations)
        if cached is not None:
            return cached

        # #AI-slop
        items = [
            loc
            async for loc in JobLocation.objects.annotate(
                job_count=Count("job", filter=Q(job__is_published=True))
            ).order_by("-job_count")
        ]

        await settings.CACHE_RAM.aset(
            JobsQuery.CacheKey.Locations, items, timeout=settings.SOLO_CACHE_TIMEOUT
        )
        return cast(list[JobLocationType], items)

    @strawberry_django.field
    async def job_faq_questions(self) -> list[JobFaqQuestionType]:
        return await get_list_cached(JobFaqQuestion, cache_key=JobsQuery.CacheKey.Faq)

    @strawberry_django.field
    async def job_by_slug(self, info: strawberry.Info, slug: str) -> JobType | None:
        user = await get_user_maybe(info)
        job = await filter_jobs_by_user(user).filter(slug=slug).afirst()
        return cast(JobType | None, job)

    @strawberry_django.field
    async def job_alerts(self, info: strawberry.Info) -> list[JobAlertType]:
        job_alert_ids_ext = await _read_session_job_alerts(info)
        if not job_alert_ids_ext:
            return []
        alerts = JobAlert.objects.filter(id_ext__in=job_alert_ids_ext).order_by("-created_at")
        return cast(list[JobAlertType], alerts)

    @strawberry_django.field(extensions=[IsAuthenticated()])
    async def job_versions_pending(self, info: strawberry.Info) -> list[JobVersionType]:
        user = await get_user(info)
        drafts = (
            Job.objects.filter(is_published=False).select_related("org").order_by("-updated_at")
        )
        drafts = filter_jobs_by_user(user, jobs=drafts)
        job_versions = [await _compose_job_version(user, draft) async for draft in drafts]
        return [job_version for job_version in job_versions if job_version]


async def _compose_job_version(user: User, job_draft: Job) -> JobVersionType | None:
    """
    #AI
    """
    jobs_published = Job.objects.filter(slug=job_draft.slug, is_published=True).select_related(
        "org"
    )
    jobs_published = filter_jobs_by_user(user, jobs=jobs_published)
    job_published = await jobs_published.afirst()
    if not job_published:
        return None

    return JobVersionType(
        id=strawberry.ID(str(job_draft.id)),
        draft_markdown=await serialize_job_to_markdown(job_draft),
        published_markdown=await serialize_job_to_markdown(job_published),
        draft=job_draft,  # type: ignore[arg-type]  #bad-infer
        published=job_published,  # type: ignore[arg-type]  #bad-infer
    )


@strawberry.type
class JobsMutation:
    @strawberry_django.field(extensions=[IsStaff()])
    async def job_versions_approve(self, info: strawberry.Info, draft_ids: list[int]) -> bool:
        await publish_job_versions(draft_ids)
        return True

    @strawberry.mutation()
    async def job_alert_subscribe(
        self,
        info: strawberry.Info,
        email: str,
        tag_names: list[str] | None = None,
        location_ids: list[int] | None = None,
        is_orgs_highlighted: bool | None = None,
        salary_min: int | None = None,
        is_exclude_no_salary: bool = False,
        is_exclude_career_capital: bool | None = None,
        is_exclude_profit_for_good: bool | None = None,
        tz: str | None = None,
    ) -> bool:
        alert = await JobAlert.objects.acreate(
            email=email,
            is_orgs_highlighted=is_orgs_highlighted,
            salary_min=salary_min,
            is_exclude_no_salary=is_exclude_no_salary,
            is_exclude_career_capital=is_exclude_career_capital,
            is_exclude_profit_for_good=is_exclude_profit_for_good,
            tz=tz,
        )
        if tag_names:
            tags = PostTag.objects.filter(name__in=tag_names)
            await alert.tags.aset([tag async for tag in tags])

        if location_ids:
            locations = JobLocation.objects.filter(id__in=location_ids)
            await alert.locations.aset([loc async for loc in locations])

        await _save_session_job_alert(info=info, alert_id_ext=alert.id_ext)
        try:
            await send_job_alert_confirmation_email(alert)
        except Exception:
            sentry_sdk.capture_exception()
        return True

    @strawberry.mutation
    async def job_alert_toggle_active(self, id_ext: uuid.UUID, info: strawberry.Info) -> bool:
        session_ids = await _read_session_job_alerts(info)
        if str(id_ext) not in session_ids:
            return False
        alert = await JobAlert.objects.aget(id_ext=id_ext)
        alert.is_active = not alert.is_active
        await alert.asave()
        return True

    @strawberry.mutation
    async def job_alert_remove(self, id_ext: uuid.UUID, info: strawberry.Info) -> bool:
        session_ids = await _read_session_job_alerts(info)
        if str(id_ext) not in session_ids:
            return False
        await JobAlert.objects.filter(id_ext=id_ext).adelete()
        await _drop_session_job_alert(info, id_ext)
        return True

    @strawberry.mutation
    async def job_alert_access_session_by_id_ext(
        self, id_ext: uuid.UUID, info: strawberry.Info
    ) -> bool:
        """
        Access JobAlerts by .id_ext
        """
        if not await JobAlert.objects.filter(id_ext=id_ext).aexists():
            return False
        session_ids = await _read_session_job_alerts(info)
        if str(id_ext) not in session_ids:
            await _save_session_job_alert(info=info, alert_id_ext=id_ext)
        return True

    @strawberry.mutation
    async def job_alert_unsubscribe(self, id_ext: uuid.UUID, info: strawberry.Info) -> bool:
        # No session check/login - .id_ext is enough
        alert = await JobAlert.objects.filter(id_ext=id_ext).afirst()
        if not alert:
            # todo ? UX: shouldn't be an Error - it's a "success"/"info"
            raise strawberry.exceptions.StrawberryGraphQLError(
                "Subscription not found, or was deleted already."
            )
        alert.is_active = False
        await alert.asave()
        return True


class _session:
    job_alert_ids = "job_alert_ids"


@sync_to_async
def _read_session_job_alerts(info: strawberry.Info) -> list[str]:
    return info.context.request.session.get(_session.job_alert_ids, [])


@sync_to_async
def _save_session_job_alert(info: strawberry.Info, alert_id_ext: uuid.UUID):
    session = info.context.request.session
    alert_ids = session.get(_session.job_alert_ids, [])
    alert_ids.append(str(alert_id_ext))
    session[_session.job_alert_ids] = alert_ids
    session.set_expiry(3600 * 24 * 365)  # 1y


@sync_to_async
def _drop_session_job_alert(info: strawberry.Info, alert_id_ext: uuid.UUID):
    session = info.context.request.session
    alert_ids_old = session.get(_session.job_alert_ids, [])
    session[_session.job_alert_ids] = [
        id_ext for id_ext in alert_ids_old if id_ext != str(alert_id_ext)
    ]
