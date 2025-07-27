from neuronhub.apps.posts.models import Post, PostTag, PostTagVote
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestPostTagVoteGraphQL(NeuronTestCase):
    async def test_user_post_tag_votes_query(self):
        post = await self.gen.posts.create(
            self.gen.posts.Params(type=Post.Type.Tool, title="Test Tool")
        )

        tag = await PostTag.objects.acreate(name="TestTag", author=self.user)

        await PostTagVote.objects.acreate(
            post=post, tag=tag, author=self.user, is_vote_positive=True
        )

        result = await self.graphql_query(
            """
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
            """,
            user_authed=self.user,
        )

        self.assertIsNone(result.errors)

        user_data = result.data["user_current"]
        self.assertEqual(user_data["username"], self.user.username)

        votes = user_data["post_tag_votes"]
        test_vote = next((v for v in votes if v["tag"]["name"] == "TestTag"), None)

        self.assertIsNotNone(test_vote)
        self.assertEqual(test_vote["tag"]["name"], "TestTag")
        self.assertEqual(test_vote["author"]["username"], self.user.username)
        self.assertTrue(test_vote["is_vote_positive"])
        self.assertFalse(test_vote["is_changed_my_mind"])

    async def test_post_tag_votes_on_post(self):
        post = await self.gen.posts.create(
            self.gen.posts.Params(type=Post.Type.Tool, title="Test Tool with Tags")
        )

        tag1 = await PostTag.objects.acreate(name="Tag1", author=self.user)
        tag2 = await PostTag.objects.acreate(name="Tag2", author=self.user)

        await PostTagVote.objects.acreate(
            post=post, tag=tag1, author=self.user, is_vote_positive=True
        )

        await PostTagVote.objects.acreate(
            post=post, tag=tag2, author=self.user, is_vote_positive=False
        )

        result = await self.graphql_query(
            """
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
            """,
            variables={"pk": str(post.id)},
            user_authed=self.user,
        )

        self.assertIsNone(result.errors)

        post_data = result.data["post_tool"]
        self.assertEqual(post_data["title"], "Test Tool with Tags")

        tag_votes = post_data["tag_votes"]
        self.assertEqual(len(tag_votes), 2)

        vote_by_tag = {v["tag"]["name"]: v["is_vote_positive"] for v in tag_votes}
        self.assertTrue(vote_by_tag["Tag1"])
        self.assertFalse(vote_by_tag["Tag2"])
