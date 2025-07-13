from enum import Enum
from subprocess import Popen

import pytest
from playwright.async_api import Page
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
    selector_enum: ButtonSelector,
):
    helper = await PlaywrightHelper.create(page, live_server)
    await helper.navigate("/reviews")

    selector: str = selector_enum.value
    attr_name = "data-state"
    state_initial = await helper.get_attr_value(selector, attr_name)
    state_expected = "unchecked" if state_initial == "checked" else "checked"

    await helper.click_and_wait(selector)
    assert await helper.get_attr_value(selector, attr_name) == state_expected

    await helper.reload()
    assert await helper.get_attr_value(selector, attr_name) == state_expected
