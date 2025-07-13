import pytest
from playwright.async_api import Page
from pytest_django.live_server_helper import LiveServer
from subprocess import Popen

from neuronhub.apps.tests.playwright_helper import PlaywrightHelper


@pytest.mark.asyncio
async def test_review_tags_are_visible(
    page: Page,
    live_server: LiveServer,
    vite_server: Popen,
):
    helper = await PlaywrightHelper.create(page, live_server)
    await helper.navigate("/reviews")

    tags = await helper.get_all('[data-testid="review-tag"]')
    assert tags

    assert await helper.count_elems('[data-testid="author-vote-plus"]')
    assert await helper.count_elems('[data-testid="author-vote-minus"]')
