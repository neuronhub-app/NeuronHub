from typing import cast

import strawberry
import strawberry_django
from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Model
from strawberry import auto

from neuronhub.apps.sites.models import FooterLink
from neuronhub.apps.sites.models import FooterSection
from neuronhub.apps.sites.models import NavbarLink
from neuronhub.apps.sites.models import NavbarLinkSection
from neuronhub.apps.sites.models import SiteConfig


@strawberry_django.type(NavbarLink)
class NavbarLinkType:
    id: auto
    label: auto
    href: auto
    order: auto


@strawberry_django.type(NavbarLinkSection)
class NavbarLinkSectionType:
    id: auto
    label: auto
    href: auto
    order: auto
    links: list[NavbarLinkType]


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


@strawberry_django.type(SiteConfig)
class SiteConfigType:
    name: auto
    domain: auto
    logo_url: auto
    contact_email: auto

    feedback_form_url: auto
    submit_job_url: auto

    @strawberry_django.field()
    async def jobs_url_utm_source(self) -> str:
        site_config = await SiteConfig.get_solo()
        return site_config.jobs_url_utm_source

    @strawberry_django.field()
    async def nav_links(self) -> list[NavbarLinkSectionType]:
        return await get_list_cached(
            NavbarLinkSection,
            cache_key=SitesQuery.CacheKey.NavLinks,
            prefetch_related=["links"],
        )

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

    # todo ? refac: cache in RAM -> then dorp get_list_cached
    # though django-solo caches it for 4h. I wonder if Strawberry ignores it.
    @strawberry_django.field()
    async def site(self) -> SiteConfigType:
        return cast(SiteConfigType, await SiteConfig.get_solo())


@strawberry.type(name="Mutation")
class SitesMutation:
    @strawberry.mutation
    async def send_contact_message(
        self,
        message: str,
        name: str | None = None,
        email: str | None = None,
    ) -> bool:
        subject = f"{settings.CLIENT_DOMAIN} - Contact form"
        if name:
            subject += f" from {name}"

        body = message
        if email:
            body += f"\n\nReply to: {email}"

        site = await SiteConfig.get_solo()

        await sync_to_async(send_mail)(
            subject=subject,
            message=body,
            from_email=site.sender_email,
            recipient_list=[site.contact_email],
        )
        return True


async def get_list_cached[Return: type](
    model: type[Model],
    cache_key: str,
    prefetch_related: list[str] | None = None,
) -> list[Return]:
    items_cached = await settings.CACHE_RAM.aget(cache_key)
    if items_cached is not None:
        return items_cached

    items_qs = model.objects.all()  # type: ignore[attr-defined] #bad-infer
    if prefetch_related:
        items_qs = items_qs.prefetch_related(*prefetch_related)
    items = [link async for link in items_qs]

    await settings.CACHE_RAM.aset(cache_key, items, timeout=settings.SOLO_CACHE_TIMEOUT)

    return cast(list[Return], items)
