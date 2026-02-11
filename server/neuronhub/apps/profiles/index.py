from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.profiles.models import Profile


if settings.ALGOLIA["IS_ENABLED"]:
    # todo ! feat: add setup_virtual_replica_sorted_by_votes for sort by ProfileMatch.match_score

    @register(Profile)
    class ProfileIndex(AlgoliaIndex):
        index_name = "profiles"

        fields = [
            ["get_id_as_str", "id"],
            "first_name",
            "last_name",
            "company",
            "job_title",
            "career_stage",
            ["get_tag_skills_names", "skills"],
            ["get_tag_interests_names", "interests"],
            ["get_biography_cropped", "biography"],
            ["get_seeks_cropped", "seeks"],
            ["get_offers_cropped", "offers"],
            "country",
            "city",
            ["get_visible_to", "visible_to"],
            "url_linkedin",
            "url_conference",
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
                "searchable(skills)",
                "searchable(interests)",
                "searchable(career_stage)",
                "searchable(country)",
                "visible_to",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
            "attributesToSnippet": [
                "biography:100",
                "seeks:50",
                "offers:50",
            ],
        }
