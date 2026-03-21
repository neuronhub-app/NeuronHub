from django.conf import settings
from django.core import mail
from django.test import override_settings

from neuronhub.apps.jobs.services.send_job_alerts import _get_jobs_matching_qs
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alert_confirmation_email
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alerts
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestSendJobAlertEmails(NeuronTestCase):
    async def test_skips_already_notified(self):
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job()

        stats = await send_job_alerts()
        assert stats.sent == 2
        assert len(mail.outbox) == 2
        mail.outbox.clear()

        stats = await send_job_alerts()
        assert stats.skipped == 2
        assert len(mail.outbox) == 0

    async def test_skips_inactive(self):
        await self.gen.jobs.job_alert(is_active=False)
        await self.gen.jobs.job()
        stats = await send_job_alerts()
        assert stats.sent == 0

    async def test_sends_only_at_the_tz_hour(self):
        await self.gen.jobs.job_alert(tz=settings.TIME_ZONE)
        await self.gen.jobs.job()

        hour_current = self.gen.datetime_now().hour
        hour_future = hour_current + 12

        stats = await send_job_alerts(hour_local_to_send_at=hour_future)
        assert stats.skipped_due_to_tz == 1
        assert stats.sent == 0
        assert len(mail.outbox) == 0

        stats = await send_job_alerts(hour_local_to_send_at=hour_current)
        assert stats.skipped_due_to_tz == 0
        assert stats.sent == 1

    async def test_sends_always_if_no_tz_is_defined(self):
        await self.gen.jobs.job_alert(tz=None)
        await self.gen.jobs.job()
        hour_future = self.gen.datetime_now().hour + 12
        stats = await send_job_alerts(hour_local_to_send_at=hour_future)
        assert stats.sent == 1
        assert stats.skipped_due_to_tz == 0

        # no duplicate JobAlerts:
        hour_future_2 = hour_future + 2
        stats = await send_job_alerts(hour_local_to_send_at=hour_future_2)
        assert stats.sent == 0
        assert stats.skipped_due_to_tz == 0
        assert stats.skipped == 1

    async def test_template_override(self):
        site = await SiteConfig.get_solo()

        test_name = "Custom"
        test_addr = "Override Addr"
        site.email_template_job_alert_confirmation = (
            "<html><body>" + test_name + "{{ site_name }} - {{ address }}</body></html>"
        )
        site.address = test_addr
        await site.asave()

        alert = await self.gen.jobs.job_alert()
        await send_job_alert_confirmation_email(alert)

        email_html = mail.outbox[0].alternatives[0][0]
        assert test_name in email_html
        assert test_addr in email_html

    # tags_* filters
    # ----------------------------------------------------------------------------
    # todo ? refac: parametrize to dedup

    async def test_matches_by_country_tag(self):
        tag_uk = await self.gen.posts.tag("UK", Category.Country)
        tag_de = await self.gen.posts.tag("Germany", Category.Country)

        await self.gen.jobs.job(tags=[tag_uk])
        await self.gen.jobs.job(tags=[tag_de])

        alert = await self.gen.jobs.job_alert(tags=[tag_uk])

        assert 1 == len(await _get_jobs_matching_qs(alert))

    async def test_matches_by_city_tag(self):
        tag_london = await self.gen.posts.tag("London", Category.City)

        await self.gen.jobs.job(tags=[tag_london])
        await self.gen.jobs.job()

        alert = await self.gen.jobs.job_alert(tags=[tag_london])

        assert 1 == len(await _get_jobs_matching_qs(alert))

    async def test_matches_by_country_visa_sponsor_tag(self):
        tag_us_visa = await self.gen.posts.tag("US Visa", Category.VisaSponsorship)

        await self.gen.jobs.job(tags=[tag_us_visa])
        await self.gen.jobs.job()

        alert = await self.gen.jobs.job_alert(tags=[tag_us_visa])

        assert 1 == len(await _get_jobs_matching_qs(alert))


Category = TagCategoryEnum
