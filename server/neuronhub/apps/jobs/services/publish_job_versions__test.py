from django.db import IntegrityError

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestApproveVersions(NeuronTestCase):
    async def test_new_draft_publish_reuses_job_published_slug(self):
        job_pub = await self.gen.jobs.job()
        job_draft = await self.gen.jobs.job_draft(job=job_pub)

        slug_before = job_pub.slug

        await publish_job_versions([job_draft.pk])

        assert not await Job.objects.filter(pk=job_pub.pk).aexists()

        await job_draft.arefresh_from_db()
        assert await job_draft.version_of.acount() == 0
        assert job_draft.is_published
        assert job_draft.slug == slug_before

    async def test_is_in_algolia_index(self):
        assert (await self.gen.jobs.job()).is_in_algolia_index()
        assert (await self.gen.jobs.job(is_published=False)).is_in_algolia_index() is False

    async def test_is_pending_removal_approval_deletes_all_job_versions(self):
        org = await self.gen.orgs.create()

        job_published = await self.gen.jobs.job(org=org)
        job_draft = await self.gen.jobs.job(org=org, is_published=False)
        job_draft.is_pending_removal = True
        await job_draft.asave()
        await job_published.versions.aadd(job_draft)

        await publish_job_versions([job_draft.pk])

        assert not await Job.objects.filter(pk=job_published.pk).aexists()
        assert not await Job.objects.filter(pk=job_draft.pk).aexists()

    async def test_slug_dup_is_rejected(self):
        job = await self.gen.jobs.job()
        with self.assertRaises(IntegrityError):
            await self.gen.jobs.job(slug=job.slug)

    async def test_slug_dup_is_ok_in_drafts(self):
        job = await self.gen.jobs.job()
        job_draft_1 = await self.gen.jobs.job(is_published=False, slug=job.slug)
        job_draft_2 = await self.gen.jobs.job(is_published=False, slug=job.slug)
        assert job.slug == job_draft_1.slug == job_draft_2.slug

    async def test_orphan_draft_with_slug_colliding_with_unrelated_pub_is_reslugged(
        self,
    ):
        job = await self.gen.jobs.job()
        job_draft_unrelated = await self.gen.jobs.job(is_published=False, slug=job.slug)

        await publish_job_versions([job_draft_unrelated.pk])

        assert await Job.objects.filter(pk=job.pk).aexists()
        await job_draft_unrelated.arefresh_from_db()
        assert job_draft_unrelated.is_published
        assert job_draft_unrelated.slug != job.slug
