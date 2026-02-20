import strawberry
import strawberry_django
from django.db.models import QuerySet
from strawberry import auto

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.filter_jobs_by_user import filter_jobs_by_user
from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.users.graphql.resolvers import get_user_sync


@strawberry_django.filter_type(Job, lookups=True)
class JobFilter:
    id: auto


@strawberry_django.type(Job, filters=JobFilter)
class JobType:
    id: auto
    title: auto
    org: auto

    is_remote: auto
    is_remote_friendly: auto
    is_visa_sponsor: auto

    salary_min: auto
    salary_max: auto

    country: list[str]
    city: list[str]

    url_external: auto

    posted_at: auto
    closes_at: auto

    tags_skill: list[PostTagType]
    tags_area: list[PostTagType]
    tags_education: list[PostTagType]
    tags_experience: list[PostTagType]
    tags_workload: list[PostTagType]

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Job], info: strawberry.Info) -> QuerySet[Job]:
        user = get_user_sync(info)
        return filter_jobs_by_user(user, jobs=queryset)


@strawberry.type(name="Query")
class JobsQuery:
    jobs: list[JobType] = strawberry_django.field()
