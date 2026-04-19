"""
#quality-30% #AI
"""

from unittest.mock import patch

from asgiref.sync import async_to_sync

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services import airtable_sync_jobs as airtable_sync_module
from neuronhub.apps.jobs.services.airtable_sync_jobs import JobParsed
from neuronhub.apps.jobs.services.airtable_sync_jobs import LocationParsed
from neuronhub.apps.jobs.services.airtable_sync_jobs import TagParams
from neuronhub.apps.jobs.services.airtable_sync_jobs import _airtable
from neuronhub.apps.jobs.services.airtable_sync_jobs import _parse_location_field
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_jobs_parsed
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_tags
from neuronhub.apps.jobs.services.airtable_sync_jobs import airtable_sync_jobs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestAirtableSyncJobs(NeuronTestCase):
    async def test_sync_creates_new_job_drafts(self):
        org_name = "Org X"

        def gen_org_url(index):
            return f"https://example.com/job-{index}"

        records = [
            {
                "id": f"job-{index}",
                "fields": {
                    _airtable.title: f"Role {index}",
                    _airtable.org_name: f'"{org_name}"',
                    _airtable.url_external: gen_org_url(index=index),
                    _airtable.description: "Job description text.",
                    _airtable.skill_sets: "Python, TypeScript",
                    _airtable.cause_areas: "Climate",
                    _airtable.role_type: "Full-Time",
                    _airtable.experience: "Mid (5-9y)",
                    _airtable.locations: '"Remote, Global"',
                    _airtable.source: "AIM",
                    _airtable.salary_min: "48,656.00",
                    _airtable.salary_text: "$40k - $60k",
                    _airtable.deadline: "2026-05-01",
                    _airtable.date_added: "March 19, 2026",
                },
            }
            for index in range(3)
        ]
        with patch.object(airtable_sync_module, "_fetch_airtable_jobs", return_value=records):
            stats = await airtable_sync_jobs()

        assert stats.created == 3
        assert 3 == await Job.objects.filter(is_published=False).acount()
        assert 0 == await Job.objects.filter(is_published=True).acount()

        job_draft = await Job.objects.aget(url_external=gen_org_url(index=0))
        assert job_draft.source_ext == Job.SourceExt.AIM
        assert 0 == await job_draft.version_of.acount()
        assert job_draft.org_id == (await Org.objects.aget(name=org_name)).pk

    async def test_jobs_not_in_sync_become_unpublished(self):
        job_in_sync = await self.gen.jobs.job()
        job_not_in_sync = await self.gen.jobs.job()

        await _sync_jobs_parsed([_get_job_parsed(job_in_sync)])

        await job_in_sync.arefresh_from_db()
        await job_not_in_sync.arefresh_from_db()
        assert job_in_sync.is_published
        assert job_not_in_sync.is_published is False

    async def test_changes_create_a_new_job_draft(self):
        job_pub = await self.gen.jobs.job()
        updated_at_before = job_pub.updated_at
        description_before = job_pub.description

        job_parsed = _get_job_parsed(job_pub, is_change_desc=True)
        await _sync_jobs_parsed([job_parsed])

        await job_pub.arefresh_from_db()
        assert job_pub.updated_at == updated_at_before, "Job published stays unchanged"
        assert job_pub.description == description_before

        # draft is created
        job_draft = await Job.objects.aget(is_published=False)
        assert job_parsed.description == job_draft.description
        assert job_pub.url_external == job_draft.url_external
        assert job_pub == await job_draft.version_of.afirst()

    async def test_sync_is_idempotent_for_no_changes(self):
        job_pub = await self.gen.jobs.job()
        updated_at_before = job_pub.updated_at

        await _sync_jobs_parsed([_get_job_parsed(job_pub)])

        await job_pub.arefresh_from_db()
        assert job_pub.updated_at == updated_at_before
        assert not await Job.objects.filter(is_published=False).aexists(), "no new draft"

    async def test_sync_is_idempotent_for_not_changed_drafts(self):
        job_pub = await self.gen.jobs.job()
        job_parsed = _get_job_parsed(job_pub, is_change_desc=True)

        await _sync_jobs_parsed([job_parsed])
        job_draft = await Job.objects.aget(is_published=False)

        await _sync_jobs_parsed([job_parsed])
        job_draft_same = await Job.objects.aget(is_published=False)

        assert job_draft.pk == job_draft_same.pk
        assert job_pub == await job_draft_same.version_of.afirst()

    async def test_sync_is_idempotent_for_not_changed_m2m_tags(self):
        tag_skill = await self.gen.posts.tag(category=TagCategoryEnum.Skill)
        loc = await self.gen.jobs.location()
        job_pub = await self.gen.jobs.job(tags=[tag_skill], locations=[loc])

        job_parsed = _get_job_parsed(job_pub)
        job_parsed.tags_skill = [tag_skill.name]
        job_parsed.locations = [
            LocationParsed(
                name=loc.name,
                type=loc.type,
                city=loc.city,
                country=loc.country,
                is_remote=loc.is_remote,
            ),
        ]
        await _sync_jobs_parsed([job_parsed])

        assert not await Job.objects.filter(is_published=False).aexists(), "no new draft"

    def test_num_queries_bounded_per_row_is_around_30(self):
        # todo ? refac: replace with `django_assert_max_num_queries: DjangoAssertNumQueries`
        # otherwise it rots LLM context on every query change (dumps all SQL to pytest)
        job_pub = async_to_sync(self.gen.jobs.job)()
        job_parsed = _get_job_parsed(job_pub, is_change_desc=True)

        with self.assertNumQueries(31):
            async_to_sync(_sync_jobs_parsed)([job_parsed])

    async def test_creates_locations_from_parsed_record(self):
        records = [
            {
                "id": "rec1",
                "fields": {
                    _airtable.title: "Role",
                    _airtable.org_name: "Org",
                    _airtable.url_external: "https://ex.com/1",
                    _airtable.locations: '"London, UK"',
                },
            }
        ]
        with patch.object(airtable_sync_module, "_fetch_airtable_jobs", return_value=records):
            await airtable_sync_jobs()

        assert await JobLocation.objects.filter(name="London, UK").aexists()
        assert await JobLocation.objects.filter(name="UK", type="country").aexists()


def _get_job_parsed(job: Job, is_change_desc: bool = False) -> JobParsed:
    job_parsed = JobParsed(
        title=job.title,
        url_external=job.url_external,
        description=job.description,
        org_name=job.org.name,
    )
    if is_change_desc:
        job_parsed.description += " (changed)"
    return job_parsed


class TestSyncTags(NeuronTestCase):
    """
    #AI, for specific bugs that were fixed.
    """

    async def test_reuses_top_level_tag_when_duplicate_name_has_parent(self):
        """
        A child tag with same name exists under some parent (eg.
        "Cause Area / Animal Welfare") alongside a top-level tag of
        the same name -> _sync_tags must select the top-level one.
        """
        tag_top = await self.gen.posts.tag()
        tag_parent = await self.gen.posts.tag()
        await PostTag.objects.acreate(name=tag_top.name, tag_parent=tag_parent)

        tags_synced = await _sync_tags(
            params_list=[TagParams(name=tag_top.name)],
            category=TagCategoryEnum.Area,
        )

        assert [tag_top.pk] == [t.pk for t in tags_synced]

    async def test_does_not_pollute_existing_tag_categories(self):
        """
        Airtable may list the same name under multiple categories.
        An existing Skill tag must not gain an Area category silently
        - that pollutes `limit_choices_to` tag pickers elsewhere.
        """
        tag = await self.gen.posts.tag(category=TagCategoryEnum.Skill)

        await _sync_tags(
            params_list=[TagParams(name=tag.name)],
            category=TagCategoryEnum.Area,
        )

        assert [TagCategoryEnum.Skill.value] == sorted(
            [c.name async for c in tag.categories.all()]
        )

    async def test_orphan_draft_reconciles_when_published_appears(self):
        """
        Orphan draft pre-exists (eg from a prior sync before Job got
        published via another path). Sync must not spawn a 2nd draft
        for the same URL - should reuse/clean the orphan.
        """
        job_pub = await self.gen.jobs.job()
        await self.gen.jobs.job(
            org=job_pub.org,
            url_external=job_pub.url_external,
            is_published=False,
        )

        job_parsed = _get_job_parsed(job_pub)
        job_parsed.description += " change"
        await _sync_jobs_parsed([job_parsed])

        assert (
            1
            == await Job.objects.filter(
                is_published=False, url_external=job_pub.url_external
            ).acount()
        )


class TestParseLocationField:
    def test_city(self):
        city, country = "San Francisco", "United States"
        assert _parse_location_field(f'"{city}, {country}"') == [
            LocationParsed(
                name=f"{city}, {country}",
                type=JobLocation.LocationType.CITY,
                city=city,
                country=country,
                is_remote=False,
            ),
            LocationParsed(
                name=country,
                type=JobLocation.LocationType.COUNTRY,
                city="",
                country=country,
                is_remote=False,
            ),
        ]

    def test_remote(self):
        country = "Global"
        assert _parse_location_field(f'"Remote, {country}"') == [
            LocationParsed(
                name=f"Remote, {country}",
                type=JobLocation.LocationType.REMOTE,
                city="",
                country=country,
                is_remote=True,
            ),
        ]

    def test_multiple(self):
        remote_country, city, city_country = "USA", "London", "UK"
        raw = f'"Remote, {remote_country}","{city}, {city_country}"'
        assert _parse_location_field(raw) == [
            LocationParsed(
                name=f"Remote, {remote_country}",
                type=JobLocation.LocationType.REMOTE,
                city="",
                country=remote_country,
                is_remote=True,
            ),
            LocationParsed(
                name=f"{city}, {city_country}",
                type=JobLocation.LocationType.CITY,
                city=city,
                country=city_country,
                is_remote=False,
            ),
            LocationParsed(
                name=city_country,
                type=JobLocation.LocationType.COUNTRY,
                city="",
                country=city_country,
                is_remote=False,
            ),
        ]

    def test_multiple_with_space_after_comma(self):
        # Airtable cellFormat=string emits `", "` between entries.
        assert _parse_location_field('"Remote, Global", "Remote, USA"') == [
            LocationParsed(
                name="Remote, Global",
                type=JobLocation.LocationType.REMOTE,
                city="",
                country="Global",
                is_remote=True,
            ),
            LocationParsed(
                name="Remote, USA",
                type=JobLocation.LocationType.REMOTE,
                city="",
                country="USA",
                is_remote=True,
            ),
        ]
