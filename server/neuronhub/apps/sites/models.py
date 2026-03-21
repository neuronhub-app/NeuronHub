"""
See [[Sub-sites-with-VITE_SITE.md]]
"""

from asgiref.sync import sync_to_async
from django.db import models
from django.db.models import TextChoices
from django_choices_field.fields import TextChoicesField
from solo.models import SingletonModel


class SiteSlug(TextChoices):
    Neuronhub = "neuronhub"
    ProbablyGood = "pg"


_help_text = "Leave blank to use the default template. Test by saving the updated Site Config, and then pressing the 'SEND TEST * EMAIL TO YOURSELF' buttons in the top right corner."


class SiteConfig(SingletonModel):
    name = models.CharField(max_length=255, default="NeuronHub")

    domain = models.CharField(max_length=255, blank=True, default="neuronhub.app")

    slug = TextChoicesField(
        default=SiteSlug.Neuronhub,
        choices_enum=SiteSlug,
        help_text="Identifier. Also matches /client/src/sites/{directory}/",
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

    email_template_job_alert = models.TextField(
        blank=True,
        default="",
        verbose_name="Template Job alert",
        help_text=f"Specify to override the jobs/job_alert.html email template. {_help_text}",
    )
    email_template_job_alert_confirmation = models.TextField(
        blank=True,
        default="",
        verbose_name="Template Job alert confirmation",
        help_text=f"Specify to override the jobs/job_alert_confirmation.html email template. {_help_text}",
    )

    def __str__(self):
        return self.name

    @classmethod
    async def get_solo(cls) -> SiteConfig:  # type: ignore[override]
        # noinspection PyTypeChecker
        return await sync_to_async(super().get_solo)()
