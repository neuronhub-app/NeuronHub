import pytest
from playwright.async_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.playwright_helper import PlaywrightHelper


@pytest.mark.asyncio
async def test_comment_create(page: Page, live_server: LiveServer, vite_server):
    helper = await PlaywrightHelper.create(page, live_server)

    review = await Post.objects.filter(type=Post.Type.Review).afirst()
    assert review
    await helper.navigate(f"/reviews/{review.id}")

    await page.fill("textarea[placeholder='Write a comment...']", "My test comment")
    await page.click("button:has-text('Post Comment')")
    await page.wait_for_selector("text=My test comment")
    await expect(page.locator("text=My test comment")).to_be_visible()
