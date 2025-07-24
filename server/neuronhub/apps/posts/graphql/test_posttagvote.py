"""
Test PostTagVote GraphQL queries
"""

from neuronhub.apps.posts.models import Post, PostTag, PostTagVote
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestPostTagVoteGraphQL(NeuronTestCase):
    """Test PostTagVote GraphQL queries"""

    async def test_user_post_tag_votes_query(self):
        """Test querying user's post tag votes with all relationships"""
        # Create test data
        post = await self.gen.posts.create(self.gen.posts.Params(
            type=Post.Type.Tool,
            title="Test Tool"
        ))
        
        tag = await PostTag.objects.acreate(
            name="TestTag",
            author=self.user
        )
        
        # Create a PostTagVote
        await PostTagVote.objects.acreate(
            post=post,
            tag=tag,
            author=self.user,
            is_vote_positive=True
        )
        
        # Query user's post tag votes
        query = """
        query UserCurrent {
          user_current {
            username
            post_tag_votes {
              id
              tag {
                id
                name
              }
              author {
                username
              }
              is_vote_positive
              is_changed_my_mind
            }
          }
        }
        """
        
        result = await self.graphql_query(query, user_authed=self.user)
        
        # Verify no errors
        self.assertIsNone(result.errors)
        
        # Verify data
        user_data = result.data["user_current"]
        self.assertEqual(user_data["username"], self.user.username)
        
        # Find our test vote
        votes = user_data["post_tag_votes"]
        test_vote = next((v for v in votes if v["tag"]["name"] == "TestTag"), None)
        
        self.assertIsNotNone(test_vote)
        self.assertEqual(test_vote["tag"]["name"], "TestTag")
        self.assertEqual(test_vote["author"]["username"], self.user.username)
        self.assertTrue(test_vote["is_vote_positive"])
        self.assertFalse(test_vote["is_changed_my_mind"])

    async def test_post_tag_votes_on_post(self):
        """Test querying tag votes on a post"""
        # Create test data
        post = await self.gen.posts.create(self.gen.posts.Params(
            type=Post.Type.Tool,
            title="Test Tool with Tags"
        ))
        
        tag1 = await PostTag.objects.acreate(name="Tag1", author=self.user)
        tag2 = await PostTag.objects.acreate(name="Tag2", author=self.user)
        
        # Create tag votes
        await PostTagVote.objects.acreate(
            post=post,
            tag=tag1,
            author=self.user,
            is_vote_positive=True
        )
        
        await PostTagVote.objects.acreate(
            post=post,
            tag=tag2,
            author=self.user,
            is_vote_positive=False
        )
        
        # Query post with tag votes
        query = """
        query PostTool($pk: ID!) {
          post_tool(pk: $pk) {
            id
            title
            tag_votes {
              id
              tag {
                name
              }
              is_vote_positive
            }
          }
        }
        """
        
        result = await self.graphql_query(
            query,
            variables={"pk": str(post.id)},
            user_authed=self.user
        )
        
        # Verify no errors
        self.assertIsNone(result.errors)
        
        # Verify data
        post_data = result.data["post_tool"]
        self.assertEqual(post_data["title"], "Test Tool with Tags")
        
        tag_votes = post_data["tag_votes"]
        self.assertEqual(len(tag_votes), 2)
        
        # Verify votes
        vote_by_tag = {v["tag"]["name"]: v["is_vote_positive"] for v in tag_votes}
        self.assertTrue(vote_by_tag["Tag1"])
        self.assertFalse(vote_by_tag["Tag2"])