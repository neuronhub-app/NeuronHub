"""
Idempotent seed of the [[JobsLandingPage]] rows listed in [[landing_pages_sheet]].

Writes the filters + `label` with is_published=False - the resolver fills
`title`/`meta_title` from a SiteConfig template + `label`.

Names match prod exactly. A name resolving to nothing skips its whole page as
`UNMATCHED` - fix it in [[landing_pages_sheet]], then re-seed.
"""

from collections import Counter
from collections import defaultdict
from collections.abc import Callable
from collections.abc import Iterable
from dataclasses import dataclass
from dataclasses import field
from enum import StrEnum
from itertools import chain

from django.contrib.auth.models import AnonymousUser

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.models import JobsLandingPage
from neuronhub.apps.jobs.services.filter_jobs_by_user import filter_jobs_by_user
from neuronhub.apps.jobs.services.landing_pages_sheet import build_landing_page_specs
from neuronhub.apps.jobs.services.landing_pages_sheet import LandingPageSpec
from neuronhub.apps.orgs.models import OrgTypeEnum
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag


def seed_landing_pages(is_dry_run: bool) -> SeedReport:
    return SeedReport(
        pages=_seed_pages(
            specs=build_landing_page_specs(),
            candidates=_CandidatesCached.load(),
            is_dry_run=is_dry_run,
        ),
        is_dry_run=is_dry_run,
    )


def _seed_pages(
    specs: list[LandingPageSpec], candidates: _CandidatesCached, is_dry_run: bool
) -> list[PageReport]:
    pages: list[PageReport] = []
    for spec in specs:
        filters = _resolve_page_filters(spec=spec, candidates=candidates)
        is_resolved_partially = bool(filters.unmatched_names)
        is_filters_empty = not (filters.tags_all or filters.locations or spec.org_type)
        # Both would land wrong jobs on a canonical URL - another page's set, or every job.
        if is_resolved_partially or is_filters_empty:
            action_skipped = (
                PageAction.SkippedUnmatched
                if is_resolved_partially
                else PageAction.SkippedNoFilters
            )
            pages.append(
                PageReport(
                    slug=spec.slug,
                    action=action_skipped,
                    unmatched_names=filters.unmatched_names,
                )
            )
            continue
        pages.append(_seed_one_page(spec=spec, filters=filters, is_dry_run=is_dry_run))
    return pages


def _seed_one_page(spec: LandingPageSpec, filters: PageFilters, is_dry_run: bool) -> PageReport:
    action = (
        _page_action_of_existing(spec)
        if is_dry_run
        else _write_page(spec=spec, tags_all=filters.tags_all, locations=filters.locations)
    )

    return PageReport(
        slug=spec.slug,
        action=action,
        label=spec.label,
        tag_names=sorted({tag.name for tag in filters.tags_all}),
        location_names=sorted({location.name for location in filters.locations}),
        job_count=_count_live_jobs(
            category_to_tags=filters.category_to_tags,
            locations=filters.locations,
            org_type=spec.org_type,
        ),
    )


def _page_action_of_existing(spec: LandingPageSpec) -> PageAction:
    is_existing = JobsLandingPage.objects.filter(slug=spec.slug).exists()
    return PageAction.Updated if is_existing else PageAction.Created


def _write_page(
    spec: LandingPageSpec, tags_all: list[PostTag], locations: list[JobLocation]
) -> PageAction:
    # Never clobber a manager's admin edits: hence get_or_create over update_or_create.
    page, is_created = JobsLandingPage.objects.get_or_create(
        slug=spec.slug, defaults={"is_published": False}
    )
    page.tags.set([tag.pk for tag in tags_all])
    page.locations.set([location.pk for location in locations])
    page.org_type = spec.org_type
    update_fields = ["org_type"]
    if not page.label:
        page.label = spec.label
        update_fields.append("label")
    page.save(update_fields=update_fields)
    return PageAction.Created if is_created else PageAction.Updated


def _count_live_jobs(
    category_to_tags: dict[TagCategoryEnum, list[PostTag]],
    locations: list[JobLocation],
    org_type: OrgTypeEnum | None,
) -> int:
    jobs = filter_jobs_by_user(AnonymousUser(), jobs=Job.objects.filter(is_published=True))

    for category, tags in category_to_tags.items():
        job_field = Job.tag_category_to_field[category]
        jobs = jobs.filter(**{f"{job_field}__in": [tag.pk for tag in tags]})

    if locations:
        jobs = jobs.filter(locations__in=[location.pk for location in locations])

    if org_type:
        jobs = jobs.filter(org__org_type=org_type)

    return jobs.distinct().count()


def _resolve_page_filters(spec: LandingPageSpec, candidates: _CandidatesCached) -> PageFilters:
    category_to_tags, unmatched_tags = _resolve_spec_tags(spec=spec, candidates=candidates)
    locations, unmatched_locations = _resolve_names(spec.location_names, candidates.locations)
    return PageFilters(
        category_to_tags=category_to_tags,
        locations=locations,
        unmatched_names=[*unmatched_tags, *unmatched_locations],
    )


def _resolve_spec_tags(
    spec: LandingPageSpec, candidates: _CandidatesCached
) -> tuple[dict[TagCategoryEnum, list[PostTag]], list[str]]:
    unmatched: list[str] = []
    category_to_tags: dict[TagCategoryEnum, list[PostTag]] = {}
    for category, names in spec.names_by_tag_category.items():
        tags, unmatched_names = _resolve_names(names, candidates.tags_by_category[category])
        if tags:
            category_to_tags[category] = tags
        unmatched.extend(unmatched_names)
    return category_to_tags, unmatched


def _resolve_names[T](
    spec_names: list[str], candidates_by_name: dict[str, list[T]]
) -> tuple[list[T], list[str]]:
    matched: list[T] = []
    unmatched: list[str] = []
    for spec_name in spec_names:
        rows = candidates_by_name.get(spec_name, [])
        if rows:
            matched.extend(rows)
        else:
            unmatched.append(spec_name)
    return matched, unmatched


@dataclass
class _CandidatesCached:
    tags_by_category: dict[TagCategoryEnum, dict[str, list[PostTag]]]
    locations: dict[str, list[JobLocation]]

    @classmethod
    def load(cls) -> _CandidatesCached:
        return cls(
            tags_by_category={
                category: _index_by_name(
                    PostTag.objects.filter(categories__name=category),
                    get_name=lambda tag: tag.name,
                )
                for category in Job.tag_category_to_field
            },
            locations=_index_by_name(JobLocation.objects.all(), get_name=lambda loc: loc.name),
        )


def _index_by_name[T](rows: Iterable[T], get_name: Callable[[T], str]) -> dict[str, list[T]]:
    index: dict[str, list[T]] = defaultdict(list)
    for row in rows:
        if name := get_name(row):
            index[name].append(row)
    return index


class PageAction(StrEnum):
    Created = "created"
    Updated = "updated"
    SkippedUnmatched = "skipped-unmatched"
    SkippedNoFilters = "skipped-no-filters"

    @property
    def is_skipped(self) -> bool:
        return self in (PageAction.SkippedUnmatched, PageAction.SkippedNoFilters)


@dataclass
class PageFilters:
    category_to_tags: dict[TagCategoryEnum, list[PostTag]]
    locations: list[JobLocation]
    unmatched_names: list[str]

    @property
    def tags_all(self) -> list[PostTag]:
        return list(chain.from_iterable(self.category_to_tags.values()))


@dataclass
class PageReport:
    slug: str
    action: PageAction
    unmatched_names: list[str] = field(default_factory=list)
    # The proposed name - on an existing page it may differ from what renders.
    label: str = ""
    tag_names: list[str] = field(default_factory=list)
    location_names: list[str] = field(default_factory=list)
    job_count: int = 0


@dataclass
class SeedReport:
    pages: list[PageReport]
    is_dry_run: bool

    @property
    def unmatched_all(self) -> list[str]:
        return sorted(set(chain.from_iterable(page.unmatched_names for page in self.pages)))

    @property
    def counts_by_action(self) -> Counter[str]:
        return Counter(page.action.value for page in self.pages)

    @property
    def thin_count(self) -> int:
        return sum(
            1 for page in self.pages if not page.action.is_skipped and page.job_count == 0
        )
