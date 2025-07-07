from __future__ import annotations

import logging
from dataclasses import dataclass

from django.conf import settings
from playwright.async_api import Locator
from playwright.async_api import Page
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
        await self.page.goto(f"{self.live_server}/admin/login/")
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

    async def wait_for_network_idle(self):
        await self.page.wait_for_load_state("networkidle")
