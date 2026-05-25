from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async

from neuronhub.apps.jobs.services.get_jobs_public_from_ram import get_jobs_public_from_ram
from neuronhub.apps.jobs.services.get_jobs_public_from_ram import reset_jobs_loader_for_test
from neuronhub.apps.jobs.services.publish_job_versions import publish_job_versions
from neuronhub.apps.tests.test_cases import NeuronTestCase


class JobsPublicLoaderTest(NeuronTestCase):
    """
    #AI #quality-22%
    """

    def setUp(self):
        super().setUp()
        reset_jobs_loader_for_test()

    async def test_publish_invalidates_cache(self):
        pub = await self.gen.jobs.job()
        await get_jobs_public_from_ram()

        draft = await self.gen.jobs.job_draft(job=pub)
        await publish_job_versions([draft.pk])

        await draft.arefresh_from_db()
        assert any(job.pk == draft.pk for job in await get_jobs_public_from_ram())

    async def test_first_call_returns_published_jobs(self):
        job_pub = await self.gen.jobs.job()
        await self.gen.jobs.job(is_published=False)

        assert [job.pk for job in await get_jobs_public_from_ram()] == [job_pub.pk]

    async def test_second_call_uses_cache_no_db_queries(self):
        await self.gen.jobs.job()
        await get_jobs_public_from_ram()

        await self._assert_jobs_load_does_0_queries()

    @sync_to_async
    def _assert_jobs_load_does_0_queries(self):
        async def call():
            return await get_jobs_public_from_ram()

        with self.assertNumQueries(0):
            async_to_sync(call)()
