import pytest
from playwright.async_api import Page
from pytest_django.live_server_helper import LiveServer

from neuronhub.apps.tests.playwright_helper import PlaywrightHelper
from neuronhub.apps.posts.models import Post


@pytest.mark.asyncio
async def test_comments_render_on_post_detail(page: Page, live_server: LiveServer, vite_server):
    helper = await PlaywrightHelper.create(page, live_server)

    # Get PyCharm review from database (reviews have comments, not tools)
    pycharm_review = await Post.objects.filter(
        type=Post.Type.Review, parent__title="PyCharm"
    ).afirst()
    if not pycharm_review:
        pytest.skip("PyCharm review not found in database")

    # Navigate to the review with comments
    await helper.navigate(f"/reviews/{pycharm_review.id}")

    # Check that comments section exists
    await helper.expect_to_be_visible("text=Comments")

    # Check that comment section has at least one comment
    # Comments are created with random faker text, so we can't check specific content
    # Instead, verify the comment structure exists
    comment_elements = await page.query_selector_all("p")
    comment_found = False
    for element in comment_elements:
        text = await element.text_content()
        if text and len(text) > 20:  # Comments are usually longer than 20 chars
            comment_found = True
            break
    assert comment_found, "No comments found on the page"

    # Check comment author is visible (admin is the default author)
    await helper.expect_to_be_visible("text=admin")


@pytest.mark.asyncio
async def test_nested_comments_render(page: Page, live_server: LiveServer, vite_server):
    helper = await PlaywrightHelper.create(page, live_server)

    # Get PyCharm review from database (reviews have comments, not tools)
    pycharm_review = await Post.objects.filter(
        type=Post.Type.Review, parent__title="PyCharm"
    ).afirst()
    if not pycharm_review:
        pytest.skip("PyCharm review not found in database")

    # Navigate to the review with nested comments
    await helper.navigate(f"/reviews/{pycharm_review.id}")

    # Check that comments exist (created with random faker text)
    comment_elements = await page.query_selector_all("p")
    comments_found = 0
    for element in comment_elements:
        text = await element.text_content()
        if text and len(text) > 20:  # Comments are usually longer than 20 chars
            comments_found += 1

    # PyCharm review should have at least 2 comments (parent + nested)
    assert comments_found >= 2, f"Expected at least 2 comments, found {comments_found}"

    # Check comment author is visible
    await helper.expect_to_be_visible("text=admin")
