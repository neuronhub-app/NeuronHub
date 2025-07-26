from asgiref.sync import sync_to_async
from neuronhub.apps.posts.models import Post, PostTag, PostTagVote, UsageStatus
from neuronhub.apps.posts.services.create_post_review import create_post_review
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CreatePostReviewServiceTest(NeuronTestCase):
    async def test_creates_review_with_new_tool(self):
        data = PostTypeInput(
            parent=PostTypeInput(
                title="Django",
                tool_type=Post.ToolType.Program,
                github_url="https://github.com/django/django"
            ),
            title="Solid framework",
            review_rating=90,
            review_usage_status=UsageStatus.USING,
            content="Great for building web apps"
        )
        
        review = await create_post_review(self.user, data)
        
        assert review.type == Post.Type.Review
        assert review.title == "Solid framework"
        assert review.review_rating == 90
        assert review.parent.title == "Django"
        assert review.parent.type == Post.Type.Tool

    async def test_creates_review_with_existing_tool(self):
        tool = await self.gen.posts.create(self.gen.posts.Params(
            type=Post.Type.Tool,
            title="React"
        ))
        
        data = PostTypeInput(
            parent=PostTypeInput(id=tool.id, title="React"),
            title="Good for UIs",
            review_rating=75
        )
        
        review = await create_post_review(self.user, data)
        
        assert review.parent.id == tool.id
        assert review.title == "Good for UIs"

    async def test_creates_tags_with_votes(self):
        data = PostTypeInput(
            parent=PostTypeInput(title="FastAPI", tool_type=Post.ToolType.Program),
            title="Modern and fast",
            tags=[
                PostTagTypeInput(name="Python", is_vote_positive=True, comment="Great ecosystem"),
                PostTagTypeInput(name="Web Framework", is_vote_positive=True, is_important=True)
            ]
        )
        
        review = await create_post_review(self.user, data)
        tool = review.parent
        
        tags = await sync_to_async(lambda: list(review.tags.select_related("tag_parent").order_by("name")))()
        assert len(tags) == 2
        
        python_vote = await PostTagVote.objects.aget(
            post=tool,
            tag__name="Python",
            author=self.user
        )
        assert python_vote.is_vote_positive is True
        assert python_vote.comment == "Great ecosystem"
        
        web_tag = await PostTag.objects.aget(name="Web Framework")
        assert web_tag.is_important is True

    async def test_handles_hierarchical_tags(self):
        data = PostTypeInput(
            parent=PostTypeInput(title="Kubernetes", tool_type=Post.ToolType.Program),
            title="Complex but powerful",
            tags=[
                PostTagTypeInput(name="Infrastructure / Container", is_vote_positive=True)
            ]
        )
        
        review = await create_post_review(self.user, data)
        
        container_tag = await PostTag.objects.aget(name="Container")
        infra_tag = await PostTag.objects.aget(name="Infrastructure")
        
        tag_parent = await sync_to_async(lambda: container_tag.tag_parent)()
        assert tag_parent == infra_tag
        assert infra_tag.tag_parent is None
        
        data2 = PostTypeInput(
            parent=PostTypeInput(title="Docker", tool_type=Post.ToolType.Program),
            title="Great for containers",
            tags=[
                PostTagTypeInput(name="DevOps / Container / Orchestration", is_vote_positive=True)
            ]
        )
        
        review2 = await create_post_review(self.user, data2)
        
        orchestration_tag = await PostTag.objects.aget(name="Orchestration")
        devops_tag = await PostTag.objects.aget(name="DevOps")
        
        orch_parent = await sync_to_async(lambda: orchestration_tag.tag_parent)()
        assert orch_parent == devops_tag
        devops_parent = await sync_to_async(lambda: devops_tag.tag_parent)()
        assert devops_parent is None

    async def test_updates_existing_tag_votes(self):
        tool = await self.gen.posts.create(self.gen.posts.Params(
            type=Post.Type.Tool,
            title="PostgreSQL"
        ))
        python_tag = await PostTag.objects.acreate(name="Database", author=self.user)
        
        await PostTagVote.objects.acreate(
            post=tool,
            tag=python_tag,
            author=self.user,
            is_vote_positive=True,
            comment="Initial"
        )
        
        data = PostTypeInput(
            parent=PostTypeInput(id=tool.id, title="PostgreSQL"),
            title="Updated review",
            tags=[
                PostTagTypeInput(id=python_tag.id, name="Database", comment="Updated comment")
            ]
        )
        
        await create_post_review(self.user, data)
        
        vote = await PostTagVote.objects.aget(post=tool, tag=python_tag, author=self.user)
        assert vote.comment == "Updated comment"
        assert vote.is_vote_positive is True

    async def test_requires_parent_tool(self):
        from django.core.exceptions import ValidationError
        
        data = PostTypeInput(
            title="Review without parent",
            review_rating=50
        )
        
        try:
            await create_post_review(self.user, data)
            assert False, "Should have raised ValidationError"
        except ValidationError as e:
            assert "Parent tool is required" in str(e)