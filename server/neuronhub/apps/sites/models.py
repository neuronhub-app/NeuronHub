"""
See [[Sub-sites-with-VITE_SITE.md]]
"""

import textwrap
from typing import Self

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db import models
from django.db.models import TextChoices
from django_choices_field.fields import TextChoicesField
from solo.models import SingletonModel

from neuronhub.apps.db.fields import HtmlField


class SiteSlug(TextChoices):
    Neuronhub = "neuronhub"
    ProbablyGood = "pg"


_help_text = "Leave blank to use the default template. Test by saving the updated Site Config, and then pressing the 'SEND TEST * EMAIL TO YOURSELF' buttons in the top right corner."

url_with_utm_help_text = textwrap.dedent("""
    If provided - will be used on the Job board.
    But if SiteConfig.jobs_url_utm_source is set - it'll override the utm_source param of this field. 
    For details see [[siteConfigState.ts]]
""")


class SiteConfig(SingletonModel):
    name = models.CharField(max_length=255, default="NeuronHub")

    domain = models.CharField(max_length=255, blank=True, default="neuronhub.app")

    slug = TextChoicesField(
        default=SiteSlug.Neuronhub,
        choices_enum=SiteSlug,
        help_text="Identifier. Also matches /client/src/sites/{directory}/",
    )

    sender_email = models.EmailField(
        default=settings.DEFAULT_FROM_EMAIL,
        help_text="Eg used as the sender of the Job Alerts emails. But backend will use DEFAULT_FROM_EMAIL env instead for sending eg user auth management emails (password resets, etc).",
    )
    contact_email = models.EmailField(
        default=settings.DEFAULT_FROM_EMAIL,
        help_text="Used eg in the 'Contact' modal form",
    )

    logo_url = models.URLField(
        max_length=512,
        blank=True,
        default="",
        help_text="Absolute URL to the site logo PNG (exported at 2-3x for retina). Displayed at width=180px in email headers. Leave blank for text-only header.",
    )

    address = models.CharField(
        max_length=512,
        blank=True,
        default="",
        help_text="Show in the email footer (eg for Job alert emails) for US CAN-SPAM compliance. Example: `442 Sutter St Ste 401 #625 · San Francisco, CA 94102`",
    )

    feedback_form_url = models.URLField(
        max_length=512,
        blank=True,
        default="",
        help_text="URL for the feedback form link in emails",
    )
    submit_job_url = models.URLField(
        max_length=512,
        blank=True,
        default="",
        help_text="URL for 'landed a role' / 'report placement' link in Job alert emails",
    )

    jobs_url_utm_source = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="UTM source param appended to external job/org URLs on the frontend, eg `{url}?utm_source=probablygood`",
    )

    email_html_about_us = HtmlField(
        blank=True,
        default="",
        help_text="HTML for the 'About' paragraph in job alert emails. Supports inline-styled <a> tags. Leave blank for generic text.",
    )
    email_html_feedback_request = HtmlField(
        blank=True,
        default="",
        help_text="HTML for the 'landed a role' section. Supports inline-styled <a> tags. Leave blank for generic text.",
    )

    email_template_job_alert = HtmlField(
        blank=True,
        default="",
        verbose_name="Template Job alert",
        help_text=f"Specify to override the jobs/job_alert.html email template. {_help_text}",
    )
    email_template_job_alert_confirmation = HtmlField(
        blank=True,
        default="",
        verbose_name="Template Job alert confirmation",
        help_text=f"Specify to override the jobs/job_alert_confirmation.html email template. {_help_text}",
    )

    def __str__(self):
        return self.name

    @classmethod
    @sync_to_async
    def get_solo(cls) -> Self:  # type: ignore[override]
        # noinspection PyTypeChecker
        return super().get_solo()


class FooterSectionKind(TextChoices):
    Column = "column"
    Social = "social"
    Bottom = "bottom"


class FooterLinkIcon(TextChoices):
    Email = "email"
    Linkedin = "linkedin"
    Matrix = "matrix"
    Discord = "discord"
    Mastodon = "mastodon"
    Github = "github"
    Youtube = "youtube"
    Substack = "substack"
    Twitter = "twitter"
    Facebook = "facebook"
    Instagram = "instagram"


class NavbarLinkSection(models.Model):
    site = models.ForeignKey(
        SiteConfig,
        on_delete=models.CASCADE,
        related_name="nav_links",
    )
    label = models.CharField(max_length=255)
    href = models.URLField(max_length=512)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.label


class NavbarLink(models.Model):
    section = models.ForeignKey(
        NavbarLinkSection,
        on_delete=models.CASCADE,
        related_name="links",
    )
    label = models.CharField(max_length=255)
    href = models.URLField(max_length=512)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.label


class FooterSection(models.Model):
    site = models.ForeignKey(
        SiteConfig,
        on_delete=models.CASCADE,
        related_name="footer_sections",
    )
    kind = TextChoicesField(choices_enum=FooterSectionKind, default=FooterSectionKind.Column)
    title = models.CharField(max_length=255, blank=True, default="")
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class FooterLink(models.Model):
    section = models.ForeignKey(
        FooterSection,
        on_delete=models.CASCADE,
        related_name="links",
    )
    label = models.CharField(max_length=255)
    href = models.URLField(max_length=512)
    icon = TextChoicesField(choices_enum=FooterLinkIcon, blank=True, null=True, default=None)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return ""


def _on_change_invalidate_cache(**kwargs):
    from django.conf import settings

    from neuronhub.apps.sites.graphql import SitesQuery

    settings.CACHE_RAM.delete(SitesQuery.CacheKey.NavLinks)
    settings.CACHE_RAM.delete(SitesQuery.CacheKey.FooterSections)


models.signals.post_save.connect(_on_change_invalidate_cache, sender=NavbarLinkSection)
models.signals.post_delete.connect(_on_change_invalidate_cache, sender=NavbarLinkSection)
models.signals.post_save.connect(_on_change_invalidate_cache, sender=NavbarLink)
models.signals.post_delete.connect(_on_change_invalidate_cache, sender=NavbarLink)
models.signals.post_save.connect(_on_change_invalidate_cache, sender=FooterSection)
models.signals.post_delete.connect(_on_change_invalidate_cache, sender=FooterSection)
models.signals.post_save.connect(_on_change_invalidate_cache, sender=FooterLink)
models.signals.post_delete.connect(_on_change_invalidate_cache, sender=FooterLink)
