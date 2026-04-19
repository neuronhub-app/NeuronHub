"""
#AI-slop
- magic strings
"""

from django.test import override_settings

from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestJobAlertSubscribe(NeuronTestCase):
    async def test_subscribe_with_location_ids(self):
        loc_london = await self.gen.jobs.location("London")
        loc_berlin = await self.gen.jobs.location("Berlin")
        loc_remote = await self.gen.jobs.location(code="US", is_remote=True)

        res = await self.graphql_query(
            f"""
            mutation {{
                job_alert_subscribe(
                    email: "test@example.com",
                    location_ids: [{loc_london.id}, {loc_berlin.id}, {loc_remote.id}]
                )
            }}
            """,
        )
        assert not res.errors

        alert = await JobAlert.objects.alatest()
        location_ids = sorted([loc.id async for loc in alert.locations.all()])
        assert location_ids == sorted([loc_london.id, loc_berlin.id, loc_remote.id])

    async def test_subscribe_with_salary_filters(self):
        res = await self.graphql_query(
            """
            mutation {
                job_alert_subscribe(
                    email: "test@example.com",
                    salary_min: 80000,
                    is_exclude_no_salary: true
                )
            }
            """,
        )
        assert not res.errors

        alert = await JobAlert.objects.alatest()
        assert alert.salary_min == 80000
        assert alert.is_exclude_no_salary

    async def test_track_click_adds_job_and_increments_count(self):
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
        assert await alert.jobs_clicked.filter(id=job.id).aexists()
