from __future__ import annotations

import logging
from dataclasses import dataclass

from django.conf import settings
from playwright.async_api import Locator
from playwright.async_api import Page
from playwright.async_api import expect
from pytest_django.live_server_helper import LiveServer

from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate
from neuronhub.apps.tests.test_gen import Gen


logger = logging.getLogger(__name__)


@dataclass
class PlaywrightHelper:
    page: Page
    live_server: LiveServer
    gen: Gen

    @classmethod
    async def create(
        cls,
        page: Page,
        live_server: LiveServer,
    ) -> PlaywrightHelper:
        page.set_default_timeout(2_500)  # 2.5s, default is 30s

        gen = await db_stubs_repopulate(is_delete_posts=True)
        self = cls(page=page, live_server=live_server, gen=gen)
        await self.login_using_django_admin()
        return self

    async def login_using_django_admin(self):
        await self.page.goto(f"{self.live_server.url}/admin/login/")
        await self.page.fill('input[name="username"]', "admin")
        await self.page.fill('input[name="password"]', "admin")
        await self.page.click('input[type="submit"]')
        await self.wait_for_network_idle()

    async def reload(self):
        await self.page.reload()
        await self.wait_for_network_idle()

    async def navigate(self, url: str):
        if "http" not in url:
            url = f"{settings.CLIENT_URL}{url}"
        await self.page.goto(url)
        await self.wait_for_network_idle()

    def get(self, selector: str) -> Locator:
        return self.page.locator(selector).first

    async def expect_to_be_visible(self, selector: str):
        review_tags_container = self.get(selector)
        await expect(review_tags_container).to_be_visible()

    async def get_all(self, selector: str) -> list[Locator]:
        return await self.page.locator(selector).all()

    async def get_attr_value(self, selector: str, attr: str) -> str | None:
        button = self.get(selector)
        return await button.get_attribute(attr)

    async def wait_for_attr_value(self, selector: str, attr: str, val_expected: str):
        # shouldn't needed, but Playwright isn't reliable
        await self.page.wait_for_function(
            f'document.querySelector("{selector}").getAttribute("{attr}") === "{val_expected}"',
            timeout=1000,
        )

    async def click_and_wait(self, selector: str):
        await self.page.click(selector)
        await self.wait_for_network_idle()

    async def count_elems(self, selector: str) -> int:
        return await self.page.locator(selector).count()

    async def get_by_content(self, selector: str, content: str) -> Locator | None:
        elements = await self.get_all(selector)
        for element in elements:
            elem_content = await element.text_content()
            if elem_content and content in elem_content:
                return element
        return None

    async def wait_for_network_idle(self):
        await self.page.wait_for_load_state("networkidle")

    async def login_as(self, username: str, password: str = None):
        if password is None:
            password = username
        await self.page.goto(f"{self.live_server.url}/admin/login/")
        await self.page.fill('input[name="username"]', username)
        await self.page.fill('input[name="password"]', password)
        await self.page.click('input[type="submit"]')
        await self.wait_for_network_idle()

    async def login_admin(self):
        await self.login_as("admin", "admin")
