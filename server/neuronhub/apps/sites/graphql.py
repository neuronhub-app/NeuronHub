from typing import cast

import strawberry
import strawberry_django
from django.conf import settings
from django.db.models import Model
from strawberry import auto

from neuronhub.apps.sites.models import FooterLink
from neuronhub.apps.sites.models import FooterSection
from neuronhub.apps.sites.models import NavbarLink
from neuronhub.apps.sites.models import SiteConfig


@strawberry_django.type(NavbarLink)
class NavbarLinkType:
    id: auto
    label: auto
    href: auto
    order: auto


@strawberry_django.type(FooterLink)
class FooterLinkType:
    id: auto
    label: auto
    href: auto
    icon: auto
    order: auto


@strawberry_django.type(FooterSection)
class FooterSectionType:
    id: auto
    kind: auto
    title: auto
    order: auto
    links: list[FooterLinkType]


@strawberry.type
class SiteType:
    @strawberry_django.field()
    async def jobs_url_utm_source(self) -> str:
        site_config = await SiteConfig.get_solo()
        return site_config.jobs_url_utm_source

    @strawberry_django.field()
    async def nav_links(self) -> list[NavbarLinkType]:
        return await get_list_cached(NavbarLink, cache_key=SitesQuery.CacheKey.NavLinks)

    @strawberry_django.field()
    async def footer_sections(self) -> list[FooterSectionType]:
        return await get_list_cached(
            FooterSection,
            cache_key=SitesQuery.CacheKey.FooterSections,
            prefetch_related=["links"],
        )


@strawberry.type(name="Query")
class SitesQuery:
    class CacheKey:
        NavLinks = "SiteNavLinks"
        FooterSections = "SiteFooterSections"

    @strawberry.field()
    def site(self) -> SiteType:
        return SiteType()


async def get_list_cached[Return: type](
    model: type[Model],
    cache_key: str,
    prefetch_related: list[str] = None,
) -> list[Return]:
    items_cached = await settings.CACHE_RAM.aget(cache_key)
    if items_cached is not None:
        return items_cached

    items_qs = model.objects.all()  # type: ignore[attr-defined] #bad-infer
    if prefetch_related:
        items_qs = items_qs.prefetch_related(*prefetch_related)
    items = [link async for link in items_qs]

    await settings.CACHE_RAM.aset(cache_key, items)

    return cast(list[Return], items)
