from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestApproveVersions(NeuronTestCase):
    """
    #AI-slop

    this shit should use gen.jobs.job(parent_version=job, is_published=False), instead of this retarded slug magic

    same as the other #AI-slop tag - unclear the fuck is test_approve_clears_version_of for
    """

    async def test_approve_replaces_published(self):
        org = (await self.gen.jobs.job()).org

        published = await self.gen.jobs.job(org=org, title="Old Title")
        draft = await self.gen.jobs.job(org=org, title="New Title", is_published=False)
        await published.versions.aadd(draft)

        slug_before = published.slug

        await publish_job_versions([draft.pk])

        assert not await Job.objects.filter(pk=published.pk).aexists()

        draft_refreshed = await Job.objects.aget(pk=draft.pk)
        assert draft_refreshed.is_published is True
        assert draft_refreshed.slug == slug_before

    async def test_approve_clears_version_of(self):
        org = (await self.gen.jobs.job()).org

        job_published = await self.gen.jobs.job(org=org, title="Title A")
        job_draft = await self.gen.jobs.job(org=org, title="Title B", is_published=False)
        await job_published.versions.aadd(job_draft)

        await publish_job_versions([job_draft.pk])

        draft_refreshed = await Job.objects.aget(pk=job_draft.pk)
        assert await draft_refreshed.version_of.acount() == 0

    async def test_is_in_algolia_index(self):
        job_published = await self.gen.jobs.job(title="Published")
        job_draft = await self.gen.jobs.job(title="Draft", is_published=False)

        assert job_published.is_in_algolia_index() is True
        assert job_draft.is_in_algolia_index() is False
