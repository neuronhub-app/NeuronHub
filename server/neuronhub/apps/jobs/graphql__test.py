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


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestJobAlertUpdate(NeuronTestCase):
    async def test_update_mutates_filters_end_to_end(self):
        loc_old = await self.gen.jobs.location("London")
        loc_new = await self.gen.jobs.location("Berlin")
        await self.gen.posts.tag(name="rust")
        alert = await self.gen.jobs.job_alert(
            tags=[await self.gen.posts.tag(name="python")],
            locations=[loc_old],
            salary_min=50000,
            is_exclude_career_capital=True,
        )

        res = await self.graphql_query(
            f"""
            mutation {{
                job_alert_update(
                    id_ext: "{alert.id_ext}",
                    tag_names: ["rust"],
                    location_ids: [{loc_new.id}],
                    salary_min: 90000,
                    is_exclude_no_salary: true,
                    is_exclude_profit_for_good: true
                )
            }}
            """,
            session={"job_alert_ids": [str(alert.id_ext)]},
        )
        assert not res.errors
        assert res.data["job_alert_update"]

        await alert.arefresh_from_db()
        assert alert.salary_min == 90000
        assert alert.is_exclude_no_salary
        assert alert.is_exclude_profit_for_good
        assert alert.is_exclude_career_capital is None  # reset by the edit
        assert [tag.name async for tag in alert.tags.all()] == ["rust"]
        assert [loc.id async for loc in alert.locations.all()] == [loc_new.id]

    async def test_update_returns_false_when_id_ext_not_in_session(self):
        alert = await self.gen.jobs.job_alert(salary_min=50000)

        res = await self.graphql_query(
            f'mutation {{ job_alert_update(id_ext: "{alert.id_ext}", salary_min: 90000) }}',
        )
        assert not res.errors
        assert res.data["job_alert_update"] is False

        await alert.arefresh_from_db()
        assert alert.salary_min == 50000

    async def test_update_succeeds_after_access_session_grants_magic_link(self):
        alert = await self.gen.jobs.job_alert(salary_min=50000)

        res = await self.graphql_query(
            f"""
            mutation {{
                access: job_alert_access_session_by_id_ext(id_ext: "{alert.id_ext}")
                update: job_alert_update(id_ext: "{alert.id_ext}", salary_min: 90000)
            }}
            """,
        )
        assert not res.errors
        assert res.data["access"]
        assert res.data["update"]

        await alert.arefresh_from_db()
        assert alert.salary_min == 90000

    async def test_update_clears_filters_with_empty_lists(self):
        alert = await self.gen.jobs.job_alert(
            tags=[await self.gen.posts.tag(name="python")],
            locations=[await self.gen.jobs.location("London")],
        )

        res = await self.graphql_query(
            f'mutation {{ job_alert_update(id_ext: "{alert.id_ext}", tag_names: [], location_ids: []) }}',
            session={"job_alert_ids": [str(alert.id_ext)]},
        )
        assert not res.errors
        assert res.data["job_alert_update"]

        assert [tag async for tag in alert.tags.all()] == []
        assert [loc async for loc in alert.locations.all()] == []
