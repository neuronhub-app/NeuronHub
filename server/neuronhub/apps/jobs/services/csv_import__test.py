import pytest
from django.conf import settings

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services.csv_import import LocationParsed
from neuronhub.apps.jobs.services.csv_import import _import_jobs_parsed
from neuronhub.apps.jobs.services.csv_import import _parse_location_field
from neuronhub.apps.jobs.services.csv_import import col_key
from neuronhub.apps.jobs.services.csv_import import csv_import_jobs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.tests.test_cases import NeuronTestCase


_jobs_csv_path = settings.BASE_DIR.parent / ".local" / "pg-jobs-new.csv"


@pytest.mark.skipif(not _jobs_csv_path.exists(), reason="needs jobs csv")
class TestCsvImportJobs(NeuronTestCase):
    async def test_import_jobs_count_idempotence(self):
        """
        #quality-55%
        """
        limit = 20

        stats = await csv_import_jobs(_jobs_csv_path, limit=limit)
        assert stats.created == limit
        assert stats.updated == 0
        assert await Job.objects.acount() == limit
        assert await Org.objects.acount() > 0
        assert await JobLocation.objects.acount() > 0

        # idempotence
        stats = await csv_import_jobs(_jobs_csv_path, limit=limit)
        assert stats.created == 0
        assert stats.updated == limit

    async def test_reimport_with_empty_tags_clears_existing(self):
        tag_skill = await self.gen.posts.tag(name="Python", category=TagCategoryEnum.Skill)
        job = await self.gen.jobs.job(url_external="https://example.com/j1", tags=[tag_skill])

        assert await job.tags_skill.acount() == 1
        await _import_jobs_parsed(
            [
                {
                    "title": job.title,
                    "url_external": job.url_external,
                    col_key.org_name: job.org.name,
                }
            ]
        )
        assert await job.tags_skill.acount() == 0

    async def test_jobs_not_in_csv_become_unpublished(self):
        job_in_csv = await self.gen.jobs.job()
        job_not_in_csv = await self.gen.jobs.job()

        assert job_in_csv.is_published
        assert job_not_in_csv.is_published

        await _import_jobs_parsed(
            [
                {
                    "title": job_in_csv.title,
                    "url_external": job_in_csv.url_external,
                    col_key.org_name: job_in_csv.org.name,
                }
            ]
        )

        await job_in_csv.arefresh_from_db()
        await job_not_in_csv.arefresh_from_db()

        assert job_in_csv.is_published
        assert job_not_in_csv.is_published is False


class TestParseLocationField:
    """
    #quality-25% #AI
    """

    def test_returns_parsed_locations_for_city(self):
        result = _parse_location_field('"San Francisco, United States"')
        assert result == [
            LocationParsed(
                name="San Francisco, United States",
                city="San Francisco",
                country="United States",
                is_remote=False,
            ),
        ]

    def test_returns_parsed_locations_for_remote(self):
        result = _parse_location_field('"Remote, Global"')
        assert result == [
            LocationParsed(name="Remote, Global", city="", country="Global", is_remote=True),
        ]

    def test_returns_parsed_locations_for_multiple(self):
        result = _parse_location_field('"Remote, USA","London, UK"')
        assert result == [
            LocationParsed(name="Remote, USA", city="", country="USA", is_remote=True),
            LocationParsed(name="London, UK", city="London", country="UK", is_remote=False),
        ]

    def test_returns_empty_list_for_empty_string(self):
        result = _parse_location_field("")
        assert result == []

    def test_returns_country_names_for_visa_sponsorship(self):
        """_parse_location_field result should allow extracting countries for visa tags."""
        result = _parse_location_field('"San Francisco, United States","London, United Kingdom"')
        countries = list(dict.fromkeys(loc.country for loc in result if not loc.is_remote))
        assert countries == ["United States", "United Kingdom"]
