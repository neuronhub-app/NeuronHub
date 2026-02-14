"""
See [[docs/architecture/Algolia.md]]
"""

import logging

from algoliasearch.search.client import SearchClientSync
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.profiles.models import Profile

logger = logging.getLogger(__name__)

algolia_replica_sorted_by_user = f"profiles_{settings.ALGOLIA['INDEX_SUFFIX']}_by__user_score"
algolia_replica_sorted_by_newest = f"profiles_{settings.ALGOLIA['INDEX_SUFFIX']}_by__newest"


def setup_replicas_sorted_by_scores():
    client = SearchClientSync(
        app_id=settings.ALGOLIA["APPLICATION_ID"], api_key=settings.ALGOLIA["API_KEY"]
    )
    client.set_settings(
        index_name=algolia_replica_sorted_by_user,
        index_settings={"customRanking": ["desc(match_score)"]},
    )
    client.set_settings(
        index_name=algolia_replica_sorted_by_newest,
        index_settings={"customRanking": ["desc(created_at_unix_aggregated)"]},
    )


if settings.ALGOLIA["IS_ENABLED"]:

    @register(Profile)
    class ProfileIndex(AlgoliaIndex):
        index_name = "profiles"

        should_index = "is_in_algolia_index"

        fields = [
            ["get_id_as_str", "id"],
            "first_name",
            "last_name",
            "company",
            "job_title",
            "career_stage",
            ["get_tag_skills_json", "skills"],
            ["get_tag_interests_json", "interests"],
            ["get_biography_cropped", "biography"],
            ["get_seeks_cropped", "seeks"],
            ["get_offers_cropped", "offers"],
            "seeking_work",
            "recruitment",
            "country",
            "city",
            ["get_visible_to", "visible_to"],
            "url_linkedin",
            "url_conference",
            # datetime - ISO format for GraphQL compatibility
            ["get_iso_created_at", "created_at"],
            ["get_iso_updated_at", "updated_at"],
            ["get_iso_content_updated_at", "content_updated_at"],
            # datetime - Unix for Algolia sorting/filtering
            ["get_unix_created_at", "created_at_unix"],
            ["get_unix_updated_at", "updated_at_unix"],
            ["get_unix_content_updated_at", "content_updated_at_unix"],
            ["get_created_at_unix_aggregated", "created_at_unix_aggregated"],
            # match status — O2O from ProfileMatch
            ["get_is_scored_by_llm", "is_scored_by_llm"],
            ["get_is_reviewed_by_user", "is_reviewed_by_user"],
            ["get_needs_reprocessing", "needs_reprocessing"],
            # match scores for sorting
            ["get_match_score_by_llm", "match_score_by_llm"],
            ["get_match_score", "match_score"],
        ]
        settings = {
            "searchableAttributes": [
                "first_name",
                "last_name",
                "company",
                "job_title",
                "biography",
                "skills",
                "interests",
                "seeks",
                "offers",
            ],
            "attributesForFaceting": [
                "searchable(skills.name)",
                "searchable(interests.name)",
                "searchable(career_stage)",
                "searchable(seeking_work)",
                "searchable(recruitment)",
                "searchable(country)",
                "searchable(company)",
                "visible_to",
                "filterOnly(is_scored_by_llm)",
                "filterOnly(is_reviewed_by_user)",
                "filterOnly(needs_reprocessing)",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
            "customRanking": [
                "desc(match_score_by_llm)",
            ],
            "replicas": [
                algolia_replica_sorted_by_user,
                algolia_replica_sorted_by_newest,
            ],
        }
