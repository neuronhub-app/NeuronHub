from neuronhub.apps.tests.test_cases import NeuronTestCase


class SeoMetasResolverTest(NeuronTestCase):
    async def test_seo_metas_returns_created_rows(self):
        await self.gen.sites.seo_meta(path="/about", meta_title="About us")
        await self.gen.sites.seo_meta(path="/contact", meta_title="Contact")

        result = await self.graphql_query(self.query)

        assert not result.errors
        by_path = {meta["path"]: meta for meta in result.data["seo_metas"]}
        assert by_path["/about"]["meta_title"] == "About us"
        assert by_path["/contact"]["meta_title"] == "Contact"

    query = """
        query SeoMetas {
            seo_metas {
                path
                meta_title
                meta_description
                meta_image_url
            }
        }
    """
