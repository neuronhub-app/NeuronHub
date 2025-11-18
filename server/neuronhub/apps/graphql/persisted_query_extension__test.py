from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.graphql.persisted_query_extension import _is_query_allowed


class GraphqlPermissionTest(NeuronTestCase):
    async def test_PostList_query(self):
        query_valid = "query PostList($category: PostCategory) {\n  posts(filters: {type: {exact: Post}, category: {exact: $category}}) {\n    ...PostFragment\n    __typename\n  }\n}\n\nfragment PostFragment on PostTypeI {\n  id\n  __typename\n  type\n  category\n  title\n  content_polite\n  content_direct\n  content_rant\n  source\n  source_author\n  post_source {\n    id\n    id_external\n    created_at_external\n    __typename\n  }\n  image {\n    url\n    name\n    __typename\n  }\n  crunchbase_url\n  github_url\n  url\n  domain\n  comments_count\n  author {\n    id\n    username\n    avatar {\n      url\n      __typename\n    }\n    __typename\n  }\n  votes {\n    id\n    is_vote_positive\n    author {\n      id\n      __typename\n    }\n    __typename\n  }\n  parent {\n    id\n    __typename\n    title\n    ... on PostToolType {\n      tool_type\n      content_polite\n      content_direct\n      content_rant\n      domain\n      github_url\n      crunchbase_url\n      __typename\n    }\n    tags {\n      ...PostTagFragment\n      __typename\n    }\n  }\n  updated_at\n  tags {\n    ...PostTagFragment\n    __typename\n  }\n}\n\nfragment PostTagFragment on PostTagType {\n  id\n  votes {\n    id\n    post {\n      id\n      __typename\n    }\n    author {\n      id\n      username\n      __typename\n    }\n    is_vote_positive\n    __typename\n  }\n  name\n  label\n  description\n  is_important\n  is_review_tag\n  tag_parent {\n    id\n    name\n    __typename\n  }\n  author {\n    id\n    username\n    __typename\n  }\n  tag_children {\n    id\n    __typename\n  }\n  __typename\n}"
        query_invalid = query_valid.replace("content_polite\n", "")
        with self.assertRaises(AssertionError):
            _is_query_allowed(query_invalid)
