from django.conf import settings

from neuronhub.apps.jobs.graphql import JobsQuery
from neuronhub.apps.tests.test_cases import NeuronTestCase


class JobLocationsCacheTest(NeuronTestCase):
    def setUp(self):
        settings.CACHE_RAM.delete(JobsQuery.CacheKey.Locations)
        settings.CACHE_RAM.delete(JobsQuery.CacheKey.Faq)

    async def test_cache_invalidated_on_location_save(self):
        await settings.CACHE_RAM.aset(JobsQuery.CacheKey.Locations, ["cached"])

        await self.gen.jobs.location()

        assert await settings.CACHE_RAM.aget(JobsQuery.CacheKey.Locations) is None
