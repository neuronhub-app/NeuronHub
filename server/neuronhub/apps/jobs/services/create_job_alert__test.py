from neuronhub.apps.jobs.services.create_job_alert import create_job_alert
from neuronhub.apps.jobs.services.utm import UtmParamsInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestCreateJobAlert(NeuronTestCase):
    async def test_create_with_location_ids(self):
        loc_london = await self.gen.jobs.location("London")
        loc_berlin = await self.gen.jobs.location("Berlin")
        loc_remote = await self.gen.jobs.location(code="US", is_remote=True)

        alert = await create_job_alert(
            email=_email,
            location_ids=[loc_london.id, loc_berlin.id, loc_remote.id],
        )

        location_ids = sorted([loc.id async for loc in alert.locations.all()])
        assert location_ids == sorted([loc_london.id, loc_berlin.id, loc_remote.id])

    async def test_create_with_salary_filters(self):
        alert = await create_job_alert(
            email=_email,
            salary_min=80000,
            is_exclude_no_salary=True,
        )
        assert alert.salary_min == 80000
        assert alert.is_exclude_no_salary

    async def test_create_stores_utm_params(self):
        alert = await create_job_alert(
            email=_email,
            utm=UtmParamsInput(utm_source="newsletter", utm_campaign="launch"),
        )
        assert alert.utm_source == "newsletter"
        assert alert.utm_campaign == "launch"
        assert alert.utm_medium == ""

    async def test_create_with_tags(self):
        await self.gen.posts.tag(name="python")
        await self.gen.posts.tag(name="django")

        alert = await create_job_alert(email=_email, tag_names=["python", "django"])

        tag_names = sorted([tag.name async for tag in alert.tags.all()])
        assert tag_names == ["django", "python"]


_email = "test@example.com"
