import pytest
from playwright.async_api import Page
from pytest_django.live_server_helper import LiveServer
from subprocess import Popen

from neuronhub.apps.tests.playwright_helper import PlaywrightHelper
from neuronhub.apps.posts.models import Post


@pytest.mark.asyncio
async def test_review_create_happy_path(
    page: Page,
    live_server: LiveServer,
    vite_server: Popen,
):
    helper = await PlaywrightHelper.create(page, live_server)

    tool = await helper.gen.posts.create(
        helper.gen.posts.Params(
            type=Post.Type.Tool,
            title="Django Web Framework",
            tool_type=Post.ToolType.Program,
        )
    )

    await helper.navigate("/reviews/create")

    await page.fill('input[name="parent.name"]', tool.title)
    await page.fill('input[name="title"]', "Great framework for web development")
    await page.fill(
        'textarea[name="content"]', "Django makes it easy to build web applications quickly."
    )

    await page.wait_for_selector('text="Usage status"')
    usage_status_buttons = await page.locator('[role="radiogroup"] button').all()
    if usage_status_buttons:
        await usage_status_buttons[0].click()

    await helper.click_and_wait('button[type="submit"]')

    await page.wait_for_url(lambda url: "/reviews/" in url and "create" not in url, timeout=5000)

    current_url = page.url
    assert "/reviews/" in current_url and "create" not in current_url, (
        f"Expected redirect to review detail page, but on {current_url}"
    )

    review_id = current_url.split("/reviews/")[1].strip("/")
    assert review_id.isdigit(), f"Expected numeric review ID in URL, got {review_id}"


@pytest.mark.asyncio
async def test_review_create_validation_errors(
    page: Page,
    live_server: LiveServer,
    vite_server: Popen,
):
    helper = await PlaywrightHelper.create(page, live_server)

    await helper.navigate("/reviews/create")

    await helper.click_and_wait('button[type="submit"]')

    assert "/reviews/create" in page.url

    toast_count = await page.locator('.chakra-toast:has-text("Review added")').count()
    assert toast_count == 0, "Form should not submit without required fields"
