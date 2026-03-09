"""
See [[docs/architecture/Algolia.md]]
"""

import logging

from algoliasearch.search.client import SearchClientSync
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.jobs.models import Job


logger = logging.getLogger(__name__)


def setup_virtual_replica_sorted_by_closes_at():
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

    @register(Job)
    class JobIndex(AlgoliaIndex):
        index_name = "jobs"

        should_index = "is_in_algolia_index"

        fields = [
            ["get_id_as_str", "id"],
            "title",
            ["get_org_json", "org"],
            ["get_tags_json_country", "tags_country"],
            ["get_tags_json_city", "tags_city"],
            "url_external",
            "is_remote",
            "salary_min",
            ["get_visible_to", "visible_to"],
            # GraphQL compatibility
            ["get_tags_json_skill", "tags_skill"],
            ["get_tags_json_area", "tags_area"],
            ["get_tags_json_education", "tags_education"],
            ["get_tags_json_experience", "tags_experience"],
            ["get_tags_json_workload", "tags_workload"],
            ["get_iso_created_at", "created_at"],
            ["get_iso_updated_at", "updated_at"],
            ["get_iso_posted_at", "posted_at"],
            ["get_iso_closes_at", "closes_at"],
            # datetime - Unix for Algolia sorting/filtering
            ["get_unix_created_at", "created_at_unix"],
            ["get_unix_updated_at", "updated_at_unix"],
            ["get_unix_posted_at", "posted_at_unix"],
            ["get_unix_closes_at", "closes_at_unix"],
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
                "searchable(tags_country.name)",
                "searchable(tags_city.name)",
                "is_remote",
                "is_remote_friendly",
                "is_visa_sponsor",
                "salary_min",
                "org.is_highlighted",
                "searchable(tags_skill.name)",
                "searchable(tags_area.name)",
                "searchable(tags_education.name)",
                "searchable(tags_experience.name)",
                "searchable(tags_workload.name)",
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
        }
