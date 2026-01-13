"""
See [[docs/architecture/Algolia.md]]
"""

from algoliasearch.search.client import SearchClientSync
from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.posts.models import Post


algolia_replica_sorted_by_votes = f"posts_{settings.ALGOLIA['INDEX_SUFFIX']}_by__votes"


def setup_virtual_replica_sorted_by_votes():
    """
    LLM claims Python lacks API for setting it in AlgoliaIndex. Doubtful, but ok for now. #AI
    """
    client = SearchClientSync(
        app_id=settings.ALGOLIA["APPLICATION_ID"], api_key=settings.ALGOLIA["API_KEY"]
    )
    client.set_settings(
        index_name=algolia_replica_sorted_by_votes,
        index_settings={"customRanking": ["desc(votes_aggregated)"]},
    )


if settings.ALGOLIA["IS_ENABLED"]:

    @register(Post)
    class PostIndex(AlgoliaIndex):
        index_name = "posts"
        should_index = "is_in_algolia_index"

        fields = [
            # Post
            ["get_id_as_str", "id"],
            "type",
            ["get_graphql_typename", "__typename"],
            "category",
            "title",
            "content_polite",
            "source",
            ["get_author_json", "author"],
            ["get_image_json", "image"],
            ["get_tags_json", "tags"],
            ["get_parent_json", "parent"],
            ["get_votes_json", "votes"],
            "comment_count",
            ["get_visible_to", "visible_to"],
            # Tool
            "tool_type",
            "domain",
            "url",
            "crunchbase_url",
            "github_url",
            # Review
            "review_rating",
            "review_experience_hours",
            "review_importance",
            "review_usage_status",
            "is_review_later",
            ["get_review_tags_json", "review_tags"],
            # apps.import
            "source_author",
            ["get_post_source_json", "post_source"],
            # datetime - ISO format for GraphQL compatibility
            ["get_iso_created_at", "created_at"],
            ["get_iso_updated_at", "updated_at"],
            ["get_iso_reviewed_at", "reviewed_at"],
            # datetime - Unix for Algolia sorting/filtering
            ["get_unix_created_at", "created_at_unix"],
            ["get_unix_updated_at", "updated_at_unix"],
            ["get_unix_reviewed_at", "reviewed_at_unix"],
            ["get_votes_aggregated", "votes_aggregated"],
            ["get_created_at_unix_aggregated", "created_at_unix_aggregated"],
        ]
        settings = {
            "searchableAttributes": [
                "title",
                "content_polite",
            ],
            "attributesForFaceting": [
                "searchable(tags.name)",
                "review_tags",
                "type",
                "category",
                "tool_type",
                "review_usage_status",
                "review_experience_hours",
                "visible_to",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
            "customRanking": [
                "desc(created_at_unix_aggregated)",
            ],
            "replicas": [
                f"virtual({algolia_replica_sorted_by_votes})",
            ],
        }
