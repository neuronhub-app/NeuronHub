from asgiref.sync import sync_to_async

from neuronhub.apps.jobs.models import JobsLandingPage
from neuronhub.apps.jobs.services.landing_pages_seed import _CandidatesCached
from neuronhub.apps.jobs.services.landing_pages_seed import _count_live_jobs
from neuronhub.apps.jobs.services.landing_pages_seed import _seed_pages
from neuronhub.apps.jobs.services.landing_pages_seed import PageAction
from neuronhub.apps.jobs.services.landing_pages_seed import seed_landing_pages
from neuronhub.apps.jobs.services.landing_pages_sheet import LandingPageSpec
from neuronhub.apps.orgs.models import OrgTypeEnum
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.tests.test_cases import NeuronTestCase


_seed = sync_to_async(seed_landing_pages)
_seed_pages_async = sync_to_async(_seed_pages)
_load_candidates = sync_to_async(_CandidatesCached.load)


class TestSeedLandingPages(NeuronTestCase):
    async def test_zero_filter_guard_skips_tag_pages_but_keeps_org_type(self):
        report = await _seed(is_dry_run=False)

        created = {page.slug for page in report.pages if page.action == PageAction.Created}
        assert created == {"government", "university", "multinational"}
        assert await JobsLandingPage.objects.acount() == len(created)
        assert any(page.action == PageAction.SkippedUnmatched for page in report.pages)

        page = await JobsLandingPage.objects.aget(slug="multinational")
        assert page.org_type == OrgTypeEnum.INTERNATIONAL_INSTITUTION

    async def test_spec_with_no_filter_at_all_is_skipped_as_no_filters(self):
        pages = await _seed_pages_async(
            specs=[LandingPageSpec("no-filters", "No Filters")],
            candidates=await _load_candidates(),
            is_dry_run=True,
        )

        assert pages[0].action == PageAction.SkippedNoFilters
        assert pages[0].unmatched_names == []

    async def test_partially_matched_spec_is_skipped_not_narrowed(self):
        await self.gen.posts.tag(name="Entry-Level", category=TagCategoryEnum.Experience)

        report = await _seed(is_dry_run=False)

        page = next(page for page in report.pages if page.slug == "entry-level-climate")
        assert page.action == PageAction.SkippedUnmatched
        assert page.unmatched_names == ["Climate Change"]
        assert not await JobsLandingPage.objects.filter(slug="entry-level-climate").aexists()

    async def test_dry_run_writes_nothing(self):
        await self._gen_climate_area()

        report = await _seed(is_dry_run=True)

        assert await JobsLandingPage.objects.acount() == 0
        assert any(page.action == PageAction.Created for page in report.pages), "would create"

    async def test_seeded_page_has_blank_title_and_is_unpublished(self):
        await self._gen_climate_area()

        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="climate")
        assert page.title == ""
        assert page.label == "Impactful Climate Change Jobs", (
            "the canonical page name, not slug-derived"
        )
        assert page.is_published is False
        assert [tag.name async for tag in page.tags.all()] == ["Climate Change"]

    async def test_idempotent_preserves_manual_is_published(self):
        await self._gen_climate_area()
        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="climate")
        page.is_published = True
        await page.asave()
        await page.tags.aclear()

        count_before = await JobsLandingPage.objects.acount()
        await _seed(is_dry_run=False)

        assert await JobsLandingPage.objects.acount() == count_before, "no duplicate pages"
        await page.arefresh_from_db()
        assert page.is_published is True, "get_or_create preserves manual edit"
        assert [tag.name async for tag in page.tags.all()] == ["Climate Change"], "re-synced"

    async def test_manager_page_on_a_canonical_slug_keeps_its_title(self):
        await self._gen_climate_area()
        await JobsLandingPage.objects.acreate(slug="climate", title="Manager H1")

        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="climate")
        assert page.title == "Manager H1", "never clobbered"
        assert page.label == "Impactful Climate Change Jobs", "a blank label is still filled"

    async def test_manager_label_survives_a_re_run(self):
        await self._gen_climate_area()
        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="climate")
        page.label = "Climate Jobs"
        await page.asave()

        await _seed(is_dry_run=False)

        await page.arefresh_from_db()
        assert page.label == "Climate Jobs"

    async def test_page_merges_tags_from_two_categories(self):
        await self._gen_climate_area()
        await self.gen.posts.tag(name="Entry-Level", category=TagCategoryEnum.Experience)

        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="entry-level-climate")
        assert sorted([tag.name async for tag in page.tags.all()]) == [
            "Climate Change",
            "Entry-Level",
        ]

    async def test_location_only_page_is_seeded_with_label_and_blank_title(self):
        await self.gen.jobs.location(city="Nairobi", country="Kenya")

        await _seed(is_dry_run=False)

        page = await JobsLandingPage.objects.aget(slug="nairobi")
        assert [loc.name async for loc in page.locations.all()] == ["Nairobi, Kenya"]
        assert page.label == "Impactful Jobs in Nairobi"
        assert page.title == "", "no page seeds a title - the template derives every H1"

    async def _gen_climate_area(self):
        return await self.gen.posts.tag(name="Climate Change", category=TagCategoryEnum.Area)


class TestJobCountSemantics(NeuronTestCase):
    async def test_and_across_categories_or_within(self):
        skill_1 = await self.gen.posts.tag(name="Python", category=TagCategoryEnum.Skill)
        skill_2 = await self.gen.posts.tag(name="Ops", category=TagCategoryEnum.Skill)
        area = await self.gen.posts.tag(name="Climate Change", category=TagCategoryEnum.Area)

        await self.gen.jobs.job(tags=[skill_1, area])
        await self.gen.jobs.job(tags=[skill_2, area])
        await self.gen.jobs.job(tags=[skill_1])
        await self.gen.jobs.job(tags=[area])

        count = await sync_to_async(_count_live_jobs)(
            category_to_tags={
                TagCategoryEnum.Skill: [skill_1, skill_2],
                TagCategoryEnum.Area: [area],
            },
            locations=[],
            org_type=None,
        )
        assert count == 2

    async def test_location_filter_and_page_report_count(self):
        area = await self.gen.posts.tag(name="Climate Change", category=TagCategoryEnum.Area)
        exp = await self.gen.posts.tag(name="Entry-Level", category=TagCategoryEnum.Experience)
        loc = await self.gen.jobs.location(is_global=True)
        await self.gen.jobs.location(country="USA", is_remote=True)
        await self.gen.jobs.job(tags=[area, exp], locations=[loc])
        await self.gen.jobs.job(tags=[area, exp])

        report = await _seed(is_dry_run=False)

        page_remote = next(page for page in report.pages if page.slug == "remote-climate")
        page_no_loc = next(page for page in report.pages if page.slug == "entry-level-climate")

        assert page_remote.job_count == 1
        assert page_no_loc.job_count == 2, "no location filter -> both jobs match"
