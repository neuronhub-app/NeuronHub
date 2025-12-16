"""
See [[docs/architecture/algolia.md]]
"""

from algoliasearch_django import AlgoliaIndex
from algoliasearch_django.decorators import register
from django.conf import settings

from neuronhub.apps.posts.models import Post


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
            # tag_names for faceting (flat list of strings)
            ["get_tag_values", "tag_names"],
            # datetime - ISO format for GraphQL compatibility
            ["get_iso_created_at", "created_at"],
            ["get_iso_updated_at", "updated_at"],
            ["get_iso_reviewed_at", "reviewed_at"],
            # datetime - Unix for Algolia sorting/filtering
            ["get_unix_created_at", "created_at_unix"],
            ["get_unix_updated_at", "updated_at_unix"],
            ["get_unix_reviewed_at", "reviewed_at_unix"],
        ]
        tags = "get_tag_values"

        settings = {
            "searchableAttributes": [
                "title",
                "content_polite",
            ],
            "attributesForFaceting": [
                "type",
                "category",
                "tool_type",
                "review_usage_status",
                "review_experience_hours",
                "review_tags",
                "tag_names",
                "visible_to",
            ],
            "unretrievableAttributes": [
                "visible_to",
            ],
        }
