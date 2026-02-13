from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.profiles.models import Profile


if settings.ALGOLIA["IS_ENABLED"]:
    # todo ! feat: add setup_virtual_replica_sorted_by_votes for sort by ProfileMatch.match_score

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
        }
