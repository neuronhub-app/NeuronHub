"""
See [[docs/architecture/Algolia.md]]
"""

import logging

from django.conf import settings

from neuronhub.apps.jobs.models import Job


logger = logging.getLogger(__name__)


def setup_virtual_replica_sorted_by_closes_at():
    from algoliasearch.search.client import SearchClientSync

    client = SearchClientSync(
        app_id=settings.ALGOLIA["APPLICATION_ID"], api_key=settings.ALGOLIA["API_KEY"]
    )
    client.set_settings(
        index_name=algolia_replica_jobs_sorted_by_closes_at,
        index_settings={"customRanking": ["asc(closes_at_unix)"]},
    )


algolia_replica_jobs_sorted_by_closes_at = (
    f"jobs_{settings.ALGOLIA['INDEX_SUFFIX']}_by_closes_at"
)


if settings.ALGOLIA["IS_ENABLED"]:
    from algoliasearch_django import AlgoliaIndex
    from algoliasearch_django.decorators import register

    @register(Job)
    class JobIndex(AlgoliaIndex):
        index_name = "jobs"

        should_index = "is_in_algolia_index"

        # todo ? refac: move out to AlgoliaModel the [for..in] and gen f"get_json_{field}" methods,
        # and type the names `tag_fields` and `datetime_fields`; create apps.aloglia.AlgoliaModelIndex.
        tag_fields = [
            "tags_skill",
            "tags_area",
            "tags_education",
            "tags_experience",
            "tags_workload",
            "tags_country",
            "tags_city",
            "tags_country_visa_sponsor",
        ]
        datetime_fields = [
            "created_at",
            "updated_at",
            "posted_at",
            "closes_at",
        ]

        fields = [
            ["get_id_as_str", "id"],
            "title",
            ["get_org_json", "org"],
            "url_external",
            "is_remote",
            "salary_min",
            "salary_text",
            ["get_visible_to", "visible_to"],
            # GraphQL compatibility
            *[(f"get_json_{field}", field) for field in tag_fields],
            *[(f"get_iso_{field}", field) for field in datetime_fields],
            # unix for Algolia's sort/filter
            *[(f"get_unix_{field}", f"{field}_unix") for field in datetime_fields],
        ]
        settings = {
            "searchableAttributes": [
                "title",
                "org.name",
                "tags_country.name",
                "tags_country.aliases",
                "tags_city.name",
                "tags_city.aliases",
                "job_title",
                "url_external",
            ],
            "attributesForFaceting": [
                "searchable(org.name)",
                *[f"searchable({field}.name)" for field in tag_fields],
                "is_remote",
                "is_remote_friendly",
                "salary_min",
                "org.is_highlighted",
                "visible_to",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
            "customRanking": [
                "desc(posted_at_unix)",
            ],
            "replicas": [
                algolia_replica_jobs_sorted_by_closes_at,
            ],
            "advancedSyntax": True,
        }

        # SQL perf fix
        def get_queryset(self):
            return (
                Job.objects.filter(is_published=True)
                .select_related(
                    "author",
                    "org",
                )
                .prefetch_related(
                    "author__connection_groups",
                    "visible_to_users",
                    "visible_to_groups",
                    "tags_skill",
                    "tags_area",
                    "tags_education",
                    "tags_experience",
                    "tags_workload",
                    "tags_country",
                    "tags_city",
                    "tags_country_visa_sponsor",
                )
            )
