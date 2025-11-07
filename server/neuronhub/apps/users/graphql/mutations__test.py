from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.graphql.types_lazy import UserListName


class TestUserCollapsedPosts(NeuronTestCase):
    async def test_query_collapsed_posts(self):
        post = await self.gen.posts.create()
        comment = await self.gen.posts.comment(post)

        result = await self.graphql_query(
            """
            mutation UpdateCollapsedComments($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
                update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
            }
            """,
            variables={
                "id": str(comment.id),
                "list_field_name": UserListName.posts_collapsed.value,
                "is_added": True,
            },
        )
        assert result.data["update_user_list"] is True

        result = await self.graphql_query(
            """
            query($parent_root_id: ID!) {
                user_current {
                    posts_collapsed(filters: { parent_root_id: { exact: $parent_root_id } }) {
                        id
                        parent_root {
                            id
                        }
                    }
                }
            }
            """,
            variables=dict(parent_root_id=post.id),
        )
        assert not result.errors

        posts_collapsed = result.data["user_current"]["posts_collapsed"]
        assert str(comment.id) in [comment["id"] for comment in posts_collapsed]
