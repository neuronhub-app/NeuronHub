from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestApproveVersions(NeuronTestCase):
    async def test_new_draft_publish_reuses_job_published_slug(self):
        org = await self.gen.orgs.create()

        job_published = await self.gen.jobs.job(org=org)
        job_draft = await self.gen.jobs.job(org=org, is_published=False)
        await job_published.versions.aadd(job_draft)

        slug_before = job_published.slug

        await publish_job_versions([job_draft.pk])

        assert not await Job.objects.filter(pk=job_published.pk).aexists()

        await job_draft.arefresh_from_db()
        assert job_draft.is_published
        assert job_draft.slug == slug_before

    async def test_new_draft_publish_deletes_prev_job_published(self):
        org = await self.gen.orgs.create()

        job_published = await self.gen.jobs.job(org=org)
        job_draft = await self.gen.jobs.job(org=org, is_published=False)
        await job_published.versions.aadd(job_draft)

        await publish_job_versions([job_draft.pk])

        await job_draft.arefresh_from_db()
        assert await job_draft.version_of.acount() == 0

    async def test_is_in_algolia_index(self):
        assert (await self.gen.jobs.job()).is_in_algolia_index()
        assert (await self.gen.jobs.job(is_published=False)).is_in_algolia_index() is False
