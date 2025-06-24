from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.graphql.types_lazy import UserListName


class PostMutationsTest(NeuronTestCase):
    async def test_update_user_list_mutation(self):
        """Test that update_user_list mutation works correctly"""
        # Create a post
        post = await self.gen.posts.create()

        # Verify user is not in reading list initially
        read_later_users = await post.users_read_later.acount()
        assert read_later_users == 0

        # Test adding user to reading list
        mutation = """
            mutation update_user_list($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
                update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
            }
        """

        variables = {
            "id": str(post.id),
            "list_field_name": UserListName.read_later.value,
            "is_added": True,
        }

        result = await self.graphql_query(mutation, variables, self.user)

        # Check mutation succeeded
        assert result.errors is None
        assert result.data["update_user_list"] is True

        # Verify user was added to reading list
        await post.arefresh_from_db()
        read_later_users = await post.users_read_later.acount()
        assert read_later_users == 1

        # Verify the specific user is in the list
        is_user_in_list = await post.users_read_later.filter(id=self.user.id).aexists()
        assert is_user_in_list is True

    async def test_remove_user_from_list_mutation(self):
        """Test removing user from reading list"""
        # Create a post and add user to reading list
        post = await self.gen.posts.create()
        await post.users_read_later.aadd(self.user)

        # Verify user is in reading list
        is_user_in_list = await post.users_read_later.filter(id=self.user.id).aexists()
        assert is_user_in_list is True

        # Test removing user from reading list
        mutation = """
            mutation update_user_list($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
                update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
            }
        """

        variables = {
            "id": str(post.id),
            "list_field_name": UserListName.read_later.value,
            "is_added": False,
        }

        result = await self.graphql_query(mutation, variables, self.user)

        # Check mutation succeeded
        assert result.errors is None
        assert result.data["update_user_list"] is True

        # Verify user was removed from reading list
        is_user_in_list = await post.users_read_later.filter(id=self.user.id).aexists()
        assert is_user_in_list is False

    async def test_update_library_list_mutation(self):
        """Test adding/removing from library list"""
        post = await self.gen.posts.create()

        # Test adding to library
        mutation = """
            mutation update_user_list($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
                update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
            }
        """

        variables = {
            "id": str(post.id),
            "list_field_name": UserListName.library.value,
            "is_added": True,
        }

        result = await self.graphql_query(mutation, variables, self.user)

        # Check mutation succeeded
        assert result.errors is None
        assert result.data["update_user_list"] is True

        # Verify user was added to library
        is_user_in_library = await post.users_library.filter(id=self.user.id).aexists()
        assert is_user_in_library is True
