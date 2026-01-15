import pytest

from neuronhub.apps.importer.models import ApiSource
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.importer.services.request_json import _get_api_source
from neuronhub.apps.tests.services.db_stubs_repopulate import post_HN_id
from neuronhub.apps.tests.test_cases import NeuronTestCase


# uses FS caching, ie hits API only on the first run
class CommentRanksDeriverTest(NeuronTestCase):
    @pytest.mark.slow
    async def test_api_threads_ranking_limit_is_respected(self):
        api_thread_limit = 10
        importer = ImporterHackerNews(
            is_use_cache=True,
            is_logging_enabled=False,
            api_threads_ranking_limit=api_thread_limit,
        )

        request_count = 0
        _request_original = importer._request

        async def _request_mock_with_count(url: str, **kwargs):
            nonlocal request_count
            if _get_api_source(url) is ApiSource.HackerNews:
                is_post_request = "/item/" in url
                if is_post_request:
                    request_count += 1
            return await _request_original(url, **kwargs)

        importer._request = _request_mock_with_count

        await importer.import_post(post_HN_id)

        assert request_count <= api_thread_limit + 1
