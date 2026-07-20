from unittest.mock import patch

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services import airtable_sync_jobs as airtable_sync_jobs_module
from neuronhub.apps.jobs.services import airtable_sync_orgs as airtable_sync_orgs_module
from neuronhub.apps.jobs.services.airtable_sync_jobs import _fetch_airtable_jobs
from neuronhub.apps.jobs.services.airtable_sync_orgs import _fetch_airtable_records
from neuronhub.apps.jobs.tasks import airtable_sync_and_publish_task
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestAirtableSyncAndPublishTask(NeuronTestCase):
    """
    #AI #quality-35%
    """

    async def test_sync_publishes_only_drafts_synced_this_run(self):
        job = await self.gen.jobs.job()
        job_updated = await self.gen.jobs.job()
        job_deleted = await self.gen.jobs.job()

        job_draft_pre_run_1 = await self.gen.jobs.job_draft(job=job, is_created_by_sync=False)
        job_draft_pre_run_2 = await self.gen.jobs.job_draft(is_pending_removal=True)

        job_created_url = self.gen.faker.url()
        job_updated_desc = "job updated desc"
        with (
            patch.object(
                airtable_sync_jobs_module,
                _fetch_airtable_jobs.__name__,
                return_value=[
                    self.gen.jobs.airtable_row(url_external=job_created_url, org_name="New Org"),
                    self.gen.jobs.airtable_row(job=job_updated, description=job_updated_desc),
                    self.gen.jobs.airtable_row(job=job),
                ],
            ),
            patch.object(
                airtable_sync_orgs_module, _fetch_airtable_records.__name__, return_value=[]
            ),
        ):
            await airtable_sync_and_publish_task.acall()

        assert await self._is_published(url=job_created_url)
        assert await self._is_published(
            url=job_updated.url_external, description=job_updated_desc
        )
        assert not await Job.objects.filter(pk=job_deleted.pk).aexists()

        # #AI, vague
        assert await Job.objects.filter(pk=job.pk, is_published=True).aexists(), "no new version"

        await job_draft_pre_run_1.arefresh_from_db()
        await job_draft_pre_run_2.arefresh_from_db()
        assert not job_draft_pre_run_1.is_published
        assert not job_draft_pre_run_2.is_published

    async def _is_published(self, url: str, description: str = "") -> bool:
        jobs = Job.objects.filter(url_external=url, is_published=True)
        if description:
            jobs = jobs.filter(description=description)
        return await jobs.aexists()
