import pytest
from playwright.async_api import Page
from pytest_django.live_server_helper import LiveServer

from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.playwright_helper import PlaywrightHelper


selector_upvote = ".comment-upvote"
selector_downvote = ".comment-downvote"
checked = "checked"
unchecked = "unchecked"


@pytest.mark.asyncio
async def test_comment_vote_core_functionality(
    page: Page,
    live_server: LiveServer,
    vite_server,
):
    helper = await PlaywrightHelper.create(page, live_server)

    review = await helper.gen.posts.create(
        helper.gen.posts.Params(
            type=Post.Type.Review,
            title="Review for Testing Comment Votes",
        )
    )
    comment = await helper.gen.posts.comment(post=review)

    await helper.navigate(f"/reviews/{review.id}")

    assert await helper.get_attr_value(selector_upvote, "data-state") == unchecked
    assert await helper.get_attr_value(selector_downvote, "data-state") == unchecked

    await helper.click_and_wait(selector_upvote)
    await helper.wait_for_attr_value(selector_upvote, "data-state", checked)
    assert await helper.get_attr_value(selector_downvote, "data-state") == unchecked

    await helper.click_and_wait(selector_downvote)
    await helper.wait_for_attr_value(selector_downvote, "data-state", checked)
    await helper.wait_for_attr_value(selector_upvote, "data-state", unchecked)

    await helper.click_and_wait(selector_downvote)
    await helper.wait_for_attr_value(selector_downvote, "data-state", unchecked)
    await helper.wait_for_attr_value(selector_upvote, "data-state", unchecked)

    await helper.click_and_wait(selector_upvote)
    await helper.wait_for_attr_value(selector_upvote, "data-state", checked)

    await helper.reload()
    assert await helper.get_attr_value(selector_upvote, "data-state") == checked
    assert await helper.get_attr_value(selector_downvote, "data-state") == unchecked


@pytest.mark.asyncio
async def test_comment_vote_multi_user_isolation(
    page: Page,
    live_server: LiveServer,
    vite_server,
):
    helper = await PlaywrightHelper.create(page, live_server)

    # Create review and comment
    review = await helper.gen.posts.create(
        helper.gen.posts.Params(type=Post.Type.Review, title="Multi-User Vote Count")
    )
    comment = await helper.gen.posts.comment(post=review)

    # Create multiple users and their votes directly in the backend
    user2 = await helper.gen.users.user(username="testuser2")
    user3 = await helper.gen.users.user(username="testuser3")

    # Create votes directly
    from neuronhub.apps.posts.models import PostVote

    await PostVote.objects.acreate(post=comment, author=user2, is_vote_positive=True)
    await PostVote.objects.acreate(post=comment, author=user3, is_vote_positive=True)

    # Navigate to the review page
    await helper.navigate(f"/reviews/{review.id}")

    # Verify vote count shows 2 (from user2 and user3)
    # The vote count is in the HStack between upvote and downvote buttons
    vote_bar = helper.page.locator(".comment-upvote").locator("..")
    vote_count_text = await vote_bar.text_content()
    # Extract just the number from the text (which includes button text)
    import re

    numbers = re.findall(r"\d+", vote_count_text or "")
    assert "2" in numbers

    # Current user (admin) hasn't voted yet
    assert await helper.get_attr_value(selector_upvote, "data-state") == unchecked
    assert await helper.get_attr_value(selector_downvote, "data-state") == unchecked

    # Admin votes up, count should be 3
    await helper.click_and_wait(selector_upvote)
    await helper.wait_for_attr_value(selector_upvote, "data-state", checked)

    # Reload and verify persistence
    await helper.reload()
    assert await helper.get_attr_value(selector_upvote, "data-state") == checked
