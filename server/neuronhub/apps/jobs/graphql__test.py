from django.test import override_settings

from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestJobAlertSubscribe(NeuronTestCase):
    async def test_alert_create_with_locations(self):
        loc_london = await self.gen.jobs.location("London", is_add_country=False)
        loc_berlin = await self.gen.jobs.location("Berlin", is_add_country=False)

        res = await self.graphql_query(
            f"""
            mutation {{
                job_alert_subscribe(
                    email: "test@example.com",
                    location_ids: [{loc_london.id}, {loc_berlin.id}]
                )
            }}
            """,
        )
        assert not res.errors
        assert res.data["job_alert_subscribe"]

        alert = await JobAlert.objects.alatest()
        location_ids = [loc.id async for loc in alert.locations.all()]
        assert sorted(location_ids) == sorted([loc_london.id, loc_berlin.id])

    async def test_alert_create_without_locations(self):
        res = await self.graphql_query(
            """
            mutation {
                job_alert_subscribe( email: "noloc@example.com" )
            }
            """,
        )
        assert not res.errors

        alert = await JobAlert.objects.alatest()
        assert 0 == await alert.locations.acount()
