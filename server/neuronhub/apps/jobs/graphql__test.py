"""
#AI-slop
- magic strings
"""

from django.test import override_settings

from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestJobAlertTrackClick(NeuronTestCase):
    async def test_track_click_adds_slug_and_increments_count(self):
        alert = await self.gen.jobs.job_alert()
        job = await self.gen.jobs.job()

        res = await self.graphql_query(
            f"""
            mutation {{
                job_alert_track_click(id: {alert.id}, job_slug: "{job.slug}")
            }}
            """,
        )
        assert not res.errors
        assert res.data["job_alert_track_click"]

        await alert.arefresh_from_db()
        assert alert.jobs_clicked_count == 1
        assert alert.jobs_clicked == [job.slug_and_date_id]

    @override_settings(SIMPLE_HISTORY_ENABLED=True)
    async def test_track_click_history_snapshot_stores_slug(self):
        alert = await self.gen.jobs.job_alert()
        job = await self.gen.jobs.job()

        res = await self.graphql_query(
            f"""
            mutation {{
                job_alert_track_click(id: {alert.id}, job_slug: "{job.slug}")
            }}
            """,
        )
        assert not res.errors

        hist_latest = await alert.history.alatest()
        assert hist_latest.jobs_clicked == [job.slug_and_date_id]
