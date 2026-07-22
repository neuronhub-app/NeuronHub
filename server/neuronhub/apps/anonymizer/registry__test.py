from asgiref.sync import sync_to_async

from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestAnonymize(NeuronTestCase):
    async def test_anonymize_fakes_email_and_array_char_fields(self):
        alert = await self.gen.jobs.job_alert()
        alert_email_before = alert.email
        alert.jobs_clicked = ["slug-1", "slug-2"]
        alert_jobs_clicked_before = alert.jobs_clicked
        user_anon = await self.gen.users.user()

        await sync_to_async(alert.anonymize)(user_anon=user_anon)

        assert alert.email != alert_email_before
        assert "@" in alert.email

        assert alert.jobs_clicked != alert_jobs_clicked_before
        assert len(alert.jobs_clicked) == len(alert_jobs_clicked_before)
        for job_slug in alert.jobs_clicked:
            assert isinstance(job_slug, str)
