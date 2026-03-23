from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from django.core.cache import cache

from neuronhub.apps.sites.graphql import SitesQuery
from neuronhub.apps.sites.models import NavbarLink
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.tests.test_cases import NeuronTestCase


class NavLinksCacheTest(NeuronTestCase):
    def setUp(self):
        cache.delete(SitesQuery.CacheKey.NavLinks)
        cache.delete(SitesQuery.CacheKey.FooterSections)

    async def test_cached_after_first_query(self):
        result = await self.graphql_query(self.site_query)
        print(result)
        assert result.data["site"]["nav_links"]
        assert await self._is_query_cached_does_0_sql_queries()

    @sync_to_async
    def _is_query_cached_does_0_sql_queries(self) -> bool:
        with self.assertNumQueries(0):
            result = async_to_sync(self.graphql_query)(self.site_query)
            return not result.errors

    async def test_cache_invalidated_on_save_and_delete(self):
        await self.graphql_query(self.site_query)
        assert await _get_cache()

        site = await SiteConfig.get_solo()
        link = await NavbarLink.objects.acreate(
            site=site, label="test", href="https://mastodon.social"
        )
        assert await _get_cache() is None

        await self.graphql_query(self.site_query)
        assert await _get_cache()
        await link.adelete()
        assert await _get_cache() is None

    # language=GraphQL
    site_query = """
        query Site {
            site {
                nav_links { id }
                footer_sections {
                    id
                    links { id  }
                }
            }
        }
    """


async def _get_cache():
    return await cache.aget(SitesQuery.CacheKey.NavLinks)
