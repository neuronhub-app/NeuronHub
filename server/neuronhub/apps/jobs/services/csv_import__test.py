from django.conf import settings
from wat import wat

from neuronhub.apps.jobs.services.csv_import import csv_import_jobs
from neuronhub.apps.tests.test_cases import NeuronTestCase


QUERY_JOBS_TAGS_FILTERED = """
    query {
        jobs {
            title
            tags_skill(filters: { categories: { name: { exact: Skill } } }) { name }
            tags_area(filters: { categories: { name: { exact: Area } } }) { name }
        }
    }
"""


class TestCsvImportJobs(NeuronTestCase):
    async def test_graphql_tags_filtered_by_category(self):
        await csv_import_jobs(settings.JOBS_CSV_PATH, is_reindex_algolia=False, limit=500)

        result = await self.graphql_query(
            """
            query {
                jobs {
                    title
                    tags_skill(filters: { categories: { name: { exact: Skill } } }) { name }
                    tags_area(filters:  { categories: { name: { exact: Area  } } }) { name }
                }
            }
            """
        )

        assert not result.errors
        jobs = result.data["jobs"]
        wat(jobs)
