from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


class CreatePostReviewTest(NeuronTestCase):
    async def test_create_review_with_new_tool(self):
        """Test creating a review with a new tool"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "Django", tool_type: Program, tags: [] }
                title: "Great framework"
                review_rating: 85
                review_usage_status: USING
                tags: []
            }) { username }
        }
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_tags(self):
        """Test creating a review with tags"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "FastAPI", tool_type: Program, tags: [] }
                title: "Excellent API framework"
                review_rating: 90
                review_usage_status: USING
                tags: [
                    { name: "Python", comment: "Great framework", is_vote_positive: true, is_important: true }
                    { name: "Web / API", comment: "For APIs", is_vote_positive: true, is_important: false }
                ]
            }) { username }
        }
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_without_parent_fails(self):
        """Test that creating a review without a parent tool fails"""
        with self.assertLogs("strawberry.execution", level="ERROR") as cm:
            result = await self.graphql_query("""
            mutation {
                create_post(data: {
                    title: "Review without tool"
                    review_rating: 50
                    review_usage_status: USING
                    tags: []
                }) { username }
            }
            """)
        assert result.errors is not None
        assert "Parent tool is required" in str(result.errors[0])
        # Verify the error was logged (but captured by assertLogs)
        assert any("Parent tool is required" in log for log in cm.output)

    async def test_create_review_with_existing_tool(self):
        """Test creating a review for an existing tool"""
        tool = await self.gen.posts.create(
            self.gen.posts.Params(
                type=Post.Type.Tool, title="React", tool_type=Post.ToolType.Program
            )
        )

        result = await self.graphql_query(f"""
        mutation {{
            create_post(data: {{
                parent: {{ id: "{tool.id}", title: "React", tags: [] }}
                title: "Good for UIs"
                review_rating: 75
                review_usage_status: USED
                tags: []
            }}) {{ username }}
        }}
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_parent_child_tags(self):
        """Test creating tags with parent/child relationships"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "Node.js", tool_type: Program, tags: [] }
                title: "Great for APIs"
                review_rating: 88
                review_usage_status: USING
                tags: [
                    { name: "Backend / API", comment: "For REST APIs", is_vote_positive: true, is_important: false }
                    { name: "Backend / Microservices", comment: "For microservices", is_vote_positive: true, is_important: true }
                ]
            }) { username }
        }
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_existing_tags(self):
        """Test using existing tags in a review"""
        from neuronhub.apps.posts.models import PostTag

        existing_tag = await PostTag.objects.acreate(name="Python", author=self.user)

        result = await self.graphql_query(f"""
        mutation {{
            create_post(data: {{
                parent: {{ title: "Flask", tool_type: Program, tags: [] }}
                title: "Simple and flexible"
                review_rating: 75
                review_usage_status: USED
                tags: [{{ id: "{existing_tag.id}", name: "Python", comment: "Existing tag", is_vote_positive: true, is_important: false }}]
            }}) {{ username }}
        }}
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_tag_importance_only(self):
        """Test creating tags with importance but no vote"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "TypeScript", tool_type: Program, tags: [] }
                title: "Great for large projects"
                review_rating: 92
                review_usage_status: USING
                tags: [{ name: "JavaScript", is_important: true }]
            }) { username }
        }
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_mixed_tag_scenarios(self):
        """Test creating review with mix of new/existing tags, votes, and importance"""
        from neuronhub.apps.posts.models import PostTag

        existing_tag = await PostTag.objects.acreate(name="Database", author=self.user)

        result = await self.graphql_query(f"""
        mutation {{
            create_post(data: {{
                parent: {{ title: "PostgreSQL", tool_type: Program, tags: [] }}
                title: "Robust database"
                review_rating: 95
                review_usage_status: USING
                tags: [
                    {{ id: "{existing_tag.id}", name: "Database", comment: "Existing tag", is_vote_positive: true }}
                    {{ name: "SQL / Advanced", comment: "Advanced SQL", is_vote_positive: true }}
                    {{ name: "ACID", is_important: true }}
                ]
            }}) {{ username }}
        }}
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_create_review_with_negative_tag_vote(self):
        """Test creating a tag with negative vote"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "MongoDB", tool_type: Program, tags: [] }
                title: "Good but has limitations"
                review_rating: 65
                review_usage_status: USED
                tags: [
                    { name: "NoSQL", comment: "Document storage", is_vote_positive: true }
                    { name: "Schema", comment: "Lacks strict schema", is_vote_positive: false, is_important: false }
                ]
            }) { username }
        }
        """)
        assert result.errors is None
        assert result.data["create_post"]["username"] == self.user.username

    async def test_partial_tag_updates_preserve_existing_votes(self):
        """Test that partial tag updates preserve existing vote values"""
        # Create initial review with tag vote
        result1 = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "Django", tool_type: Program, tags: [] }
                title: "Initial review"
                review_rating: 80
                review_usage_status: USING
                tags: [{ name: "Python", comment: "Initial comment", is_vote_positive: true, is_important: false }]
            }) { username }
        }
        """)
        assert result1.errors is None

        # Get the created entities
        from neuronhub.apps.posts.models import PostTag, PostTagVote

        python_tag = await PostTag.objects.aget(name="Python")
        tool = await Post.objects.aget(type=Post.Type.Tool, title="Django")

        # Verify initial vote
        initial_vote = await PostTagVote.objects.aget(
            post=tool, tag=python_tag, author=self.user
        )
        assert initial_vote.is_vote_positive is True
        assert initial_vote.comment == "Initial comment"
        assert python_tag.is_important is False

        # Second review with partial update - only comment and importance changed
        result2 = await self.graphql_query(f"""
        mutation {{
            create_post(data: {{
                parent: {{ id: "{tool.id}", title: "Django", tags: [] }}
                title: "Updated review"
                review_rating: 85
                review_usage_status: USING
                tags: [{{ id: "{python_tag.id}", name: "Python", comment: "Updated comment", is_important: true }}]
            }}) {{ username }}
        }}
        """)
        assert result2.errors is None

        # Verify existing vote preserved, new fields updated
        updated_vote = await PostTagVote.objects.aget(
            post=tool, tag=python_tag, author=self.user
        )
        assert updated_vote.is_vote_positive is True  # Should be preserved
        assert updated_vote.comment == "Updated comment"  # Should be updated

        await python_tag.arefresh_from_db()
        assert python_tag.is_important is True  # Should be updated

    async def test_multi_level_tag_extraction(self):
        """Test multi-level parent tag creation and name extraction"""
        result = await self.graphql_query("""
        mutation {
            create_post(data: {
                parent: { title: "Kubernetes", tool_type: Program, tags: [] }
                title: "Good for containers"
                review_rating: 80
                review_usage_status: USING
                tags: [{ name: "Infrastructure / Container / Orchestration", comment: "Multi-level test", is_vote_positive: true }]
            }) { username }
        }
        """)
        assert result.errors is None

        # Verify parent/child tag structure
        from neuronhub.apps.posts.models import PostTag

        parent_tag = await PostTag.objects.aget(name="Infrastructure")
        child_tag = await PostTag.objects.aget(name="Orchestration")  # Should extract last part
        await child_tag.arefresh_from_db(fields=["tag_parent"])
        assert child_tag.tag_parent_id == parent_tag.id
