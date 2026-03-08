from django.core import mail
from django.test import override_settings

from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.jobs.services.send_alert_email import send_job_alert_emails
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestSendJobAlertEmails(NeuronTestCase):
    async def test_sends_email_and_creates_log(self):
        alert = await self.gen.jobs.job_alert()
        job = await self.gen.jobs.job()

        await send_job_alert_emails()
        assert len(mail.outbox) == 1

        log = await JobAlertLog.objects.aget(job=job)
        assert log.email_hash == JobAlertLog.hash_email(alert.email)

        email_html = mail.outbox[0].alternatives[0][0]
        assert f"subscriptions/remove/{alert.id_ext}" in email_html

    async def test_skips_already_notified(self):
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job()

        await send_job_alert_emails()
        mail.outbox.clear()

        stats = await send_job_alert_emails()
        assert stats.skipped == 2
        assert len(mail.outbox) == 0

    async def test_skips_inactive(self):
        await self.gen.jobs.job_alert(is_active=False)
        await self.gen.jobs.job()
        stats = await send_job_alert_emails()
        assert stats.sent == 0
