from __future__ import annotations

from django.conf import settings
from playwright.async_api import Page

from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate


class PlaywrightHelper:
    @classmethod
    async def create(
        cls,
        page: Page,
        is_repopulate_db_and_login: bool = True,
    ) -> PlaywrightHelper:
        self = cls(page=page)

        if is_repopulate_db_and_login:
            await self.db_stubs_repopulate()
            await self.login_using_django_admin()

        return self

    def __init__(self, page: Page):
        self.page = page

    async def db_stubs_repopulate(self):
        await db_stubs_repopulate(is_delete_tools=True)

    async def login_using_django_admin(self):
        await self.page.goto(f"{settings.SERVER_URL}/admin/login/")
        await self.page.fill('input[name="username"]', "admin")
        await self.page.fill('input[name="password"]', "admin")
        await self.page.click('input[type="submit"]')
        await self.wait_for_idle_network()

    async def reload(self):
        await self.page.reload()
        await self.wait_for_idle_network()

    async def navigate(self, url: str):
        await self.page.goto(url)
        await self.wait_for_idle_network()

    async def wait_for_idle_network(self):
        await self.page.wait_for_load_state("networkidle")
