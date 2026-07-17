"""
[[public-api.mdx]]
"""

from django.contrib.auth.models import AnonymousUser
from strawberry.dataloader import DataLoader

from neuronhub.apps.graphql.persisted_query_extension import GraphqlQuery
from neuronhub.apps.graphql.persisted_query_extension import graphql_whitelist_BE
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.filter_jobs_by_user import filter_jobs_by_user
from neuronhub.apps.jobs.services.get_jobs_qs_prefetched import get_jobs_qs_prefetched


async def get_jobs_public_from_ram() -> list[Job]:
    return await _jobs_loader.load(_jobs_loader_key)


def clear_jobs_public_ram_cache():
    _jobs_loader.clear_all()


async def _load_jobs(keys: list[str]) -> list[list[Job]]:
    assert len(keys) == 1
    jobs = [
        job
        async for job in filter_jobs_by_user(
            jobs=get_jobs_qs_prefetched().filter(is_published=True),
            user=AnonymousUser(),
        )
    ]
    return [jobs]


_jobs_loader: DataLoader = DataLoader(load_fn=_load_jobs)  # single-key "abuse" for RAM cache.
_jobs_loader_key = "jobs_public"


graphql_whitelist_BE.register(
    GraphqlQuery(
        op_name="JobsPublic",
        # language=GraphQL
        query="""
            query JobsPublic {
                jobs_public {
                    id
                    title
                    slug
                    description
                    salary_min
                    salary_text
                    source_ext
                    url_external
                    published_at
                    closes_at
                    has_salary
                    is_orgs_highlighted
                    is_not_career_capital
                    is_not_profit_for_good
                    org {
                        id
                        slug
                        name
                        website
                        jobs_page_url
                        is_highlighted
                        description
                        logo { url }
                    }
                    locations {
                        id
                        name
                        type
                        city
                        country
                        region
                        is_remote
                        remote_name
                    }
                    tags_skill { ...Tag }
                    tags_area { ...Tag }
                    tags_education { ...Tag }
                    tags_experience { ...Tag }
                    tags_workload { ...Tag }
                }
            }

            fragment Tag on PostTagType {
                id
                name
                label
                description
                is_important
                tag_parent { id name }
            }
        """,
    )
)


def reset_jobs_loader_for_test():
    """
    #AI
    DataLoader caches `_loop` once; Django async test wrap closes & re-opens loops between methods.
    """
    _jobs_loader._loop = None
    _jobs_loader.cache_map.clear()
