"""
See [[docs/architecture/Algolia.md]]
"""

import logging

from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.jobs.models import Job


logger = logging.getLogger(__name__)

if settings.ALGOLIA["IS_ENABLED"]:

    @register(Job)
    class JobIndex(AlgoliaIndex):
        index_name = "jobs"

        should_index = "is_in_algolia_index"

        fields = [
            ["get_id_as_str", "id"],
            "title",
            "org",
            "title",
            "country",
            "city",
            "url_external",
            ["get_visible_to", "visible_to"],
            # GraphQL compatibility
            ["get_tags_json_skill", "tags_skill"],
            ["get_tags_json_area", "tags_area"],
            ["get_tags_json_education", "tags_education"],
            ["get_tags_json_experience", "tags_experience"],
            ["get_tags_json_workload", "tags_workload"],
            ["get_iso_created_at", "created_at"],
            ["get_iso_updated_at", "updated_at"],
            # datetime - Unix for Algolia sorting/filtering #prob-redundant
            ["get_unix_created_at", "created_at_unix"],
            ["get_unix_updated_at", "updated_at_unix"],
        ]
        settings = {
            "searchableAttributes": [
                "title",
                "org",
                "job_title",
                "url_external",
            ],
            "attributesForFaceting": [
                "searchable(org)",
                "searchable(country)",
                "searchable(city)",
                "is_remote",
                "is_remote_friendly",
                "is_visa_sponsor",
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
        }
