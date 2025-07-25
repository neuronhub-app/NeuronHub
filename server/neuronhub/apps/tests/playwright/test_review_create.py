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
    
    # Create parent tool in DB
    tool = await helper.gen.posts.create(helper.gen.posts.Params(
        type=Post.Type.Tool,
        title="Django Web Framework",
        tool_type=Post.ToolType.Program,
    ))
    
    await helper.navigate("/reviews/create")
    
    # Fill required fields
    # Parent tool name
    await page.fill('input[name="parent.name"]', tool.title)
    
    # Review title
    await page.fill('input[name="title"]', "Great framework for web development")
    
    # Review content (optional but let's fill it)
    await page.fill('textarea[name="content"]', "Django makes it easy to build web applications quickly.")
    
    # Usage status - required field, click first option in segment control
    # Wait for the form to be ready
    await page.wait_for_selector('text="Usage status"')
    # Click the first button in the usage status segment control
    usage_status_buttons = await page.locator('[role="radiogroup"] button').all()
    if usage_status_buttons:
        await usage_status_buttons[0].click()
    
    # Submit form
    await helper.click_and_wait('button[type="submit"]')
    
    # Verify redirect to review detail page
    current_url = page.url
    assert "/reviews/" in current_url and "create" not in current_url, f"Expected redirect to review detail page, but on {current_url}"
    
    # Extract review ID from URL
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
    
    # Click submit without filling required fields
    await helper.click_and_wait('button[type="submit"]')
    
    # Should stay on same page
    assert "/reviews/create" in page.url
    
    # Verify no success toast (form should not submit)
    toast_count = await page.locator('.chakra-toast:has-text("Review added")').count()
    assert toast_count == 0, "Form should not submit without required fields"