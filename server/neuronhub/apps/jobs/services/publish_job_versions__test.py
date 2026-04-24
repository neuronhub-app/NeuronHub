from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.tests.test_cases import NeuronTestCase


class PublishJobVersionsTest(NeuronTestCase):
    async def test_update_reuses_slug(self):
        pub = await self.gen.jobs.job()
        draft = await self.gen.jobs.job_draft(job=pub)
        pub_slug = pub.slug

        await publish_job_versions([draft.pk])

        assert not await Job.objects.filter(pk=pub.pk).aexists()
        await draft.arefresh_from_db()
        assert draft.is_published
        assert draft.slug == pub_slug
        assert await draft.version_of.acount() == 0

    async def test_can_publish_only_selected_draft(self):
        pub = await self.gen.jobs.job()
        draft_approved = await self.gen.jobs.job_draft(job=pub)
        draft_not_approved = await self.gen.jobs.job_draft(job=pub)

        await publish_job_versions([draft_approved.pk])

        await draft_not_approved.arefresh_from_db()
        assert not draft_not_approved.is_published
        assert await draft_not_approved.version_of.acount() == 0

    async def test_deletion_drops_draft_and_pub(self):
        pub = await self.gen.jobs.job()
        draft = await self.gen.jobs.job_draft(job=pub, is_pending_removal=True)

        await publish_job_versions([draft.pk])

        assert not await Job.objects.filter(pk__in=[pub.pk, draft.pk]).aexists()

    async def test_publishing_handles_delete_and_update_and_create(self):
        pub_to_del = await self.gen.jobs.job()
        draft_delete = await self.gen.jobs.job_draft(job=pub_to_del, is_pending_removal=True)

        pub_to_update = await self.gen.jobs.job()
        pub_to_update_slug = pub_to_update.slug
        draft_update = await self.gen.jobs.job_draft(job=pub_to_update)

        draft_create = await self.gen.jobs.job(is_published=False)

        await publish_job_versions([draft_delete.pk, draft_update.pk, draft_create.pk])

        assert not await Job.objects.filter(pk__in=[pub_to_del.pk, draft_delete.pk]).aexists()

        assert not await Job.objects.filter(pk=pub_to_update.pk).aexists()

        await draft_update.arefresh_from_db()
        assert draft_update.is_published
        assert draft_update.slug == pub_to_update_slug

        await draft_create.arefresh_from_db()
        assert draft_create.is_published
