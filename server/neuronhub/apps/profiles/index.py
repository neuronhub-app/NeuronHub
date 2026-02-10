from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.profiles.models import Profile


if settings.ALGOLIA["IS_ENABLED"]:

    @register(Profile)
    class ProfileIndex(AlgoliaIndex):
        index_name = "profiles"

        fields = [
            "first_name",
            "last_name",
            "company",
            "job_title",
            "career_stage",
            "biography",
            ["get_tag_skills_names", "skills"],
            ["get_tag_interests_names", "interests"],
            "seeks",
            "offers",
            "country",
            "city",
            ["get_visible_to", "visible_to"],
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
                "skills",
                "interests",
                "career_stage",
                "country",
                "visible_to",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
        }
