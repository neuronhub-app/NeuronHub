from enum import Enum
from subprocess import Popen

import pytest
from playwright.async_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from neuronhub.apps.tests.playwright_helper import PlaywrightHelper


@pytest.mark.asyncio
async def test_vote_toggle_and_persistence(
    page: Page,
    live_server: LiveServer,
    vite_server: Popen,
):
    await _open_reviews_and_verify_toggle(page, live_server, ButtonSelector.upvote)


@pytest.mark.asyncio
async def test_reading_list_toggle_and_persistence(
    page: Page,
    live_server: LiveServer,
    vite_server: Popen,
):
    await _open_reviews_and_verify_toggle(page, live_server, ButtonSelector.reading_list)


class ButtonSelector(Enum):
    upvote = ".btn-upvote"
    reading_list = ".btn-reading-list"


async def _open_reviews_and_verify_toggle(
    page: Page,
    live_server: LiveServer,
    selector: ButtonSelector,
):
    helper = await PlaywrightHelper.create(page, live_server)
    await helper.navigate("/reviews")

    button = helper.get(selector.value)
    state_initial = await button.get_attribute("data-state")
    state_expected = "unchecked" if state_initial == "checked" else "checked"

    await button.click()
    await helper.wait_for_network_idle()
    await expect(button).to_have_attribute("data-state", state_expected)

    await helper.reload()
    assert await helper.get(selector.value).get_attribute("data-state") == state_expected
