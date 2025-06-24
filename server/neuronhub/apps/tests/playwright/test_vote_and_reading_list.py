import pytest
from django.conf import settings
from playwright.async_api import Page, expect

from neuronhub.apps.tests.playwright_helper import PlaywrightHelper


async def click_and_verify_toggle(
    page: Page, helper: PlaywrightHelper, button_selector: str
) -> str:
    button = page.locator(button_selector).first
    initial_state = await button.get_attribute("data-state")
    expected_state = "unchecked" if initial_state == "checked" else "checked"

    await button.click()
    await helper.wait_for_idle_network()
    await expect(button).to_have_attribute("data-state", expected_state, timeout=5000)

    return expected_state


@pytest.mark.asyncio
@pytest.mark.django_db
async def test_vote_toggle_and_persistence(page: Page):
    helper = await PlaywrightHelper.create(page, is_repopulate_db_and_login=True)
    await helper.navigate(f"{settings.CLIENT_URL}/reviews")

    # Test toggle functionality
    upvote_final_state = await click_and_verify_toggle(page, helper, ".btn-upvote")

    # Test persistence after reload
    await helper.reload()

    assert (
        await page.locator(".btn-upvote").first.get_attribute("data-state") == upvote_final_state
    )


@pytest.mark.asyncio
@pytest.mark.django_db
async def test_reading_list_toggle_and_persistence(page: Page):
    helper = await PlaywrightHelper.create(page, is_repopulate_db_and_login=True)
    await helper.navigate(f"{settings.CLIENT_URL}/reviews")

    # Test toggle functionality
    reading_final_state = await click_and_verify_toggle(page, helper, ".btn-reading-list")

    # Test persistence after reload
    await helper.reload()

    assert (
        await page.locator(".btn-reading-list").first.get_attribute("data-state")
        == reading_final_state
    )
