from dataclasses import dataclass
from dataclasses import field
from datetime import UTC
from datetime import datetime
from datetime import timedelta

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory


@dataclass
class JobTags:
    skill: list[str] = field(default_factory=list)
    area: list[str] = field(default_factory=list)
    education: list[str] = field(default_factory=list)
    experience: list[str] = field(default_factory=list)
    workload: list[str] = field(default_factory=list)
    country: list[str] = field(default_factory=list)
    city: list[str] = field(default_factory=list)
    visa_countries: list[str] = field(default_factory=list)


@dataclass
class JobStub:
    job: Job
    org: Org
    tags: JobTags = field(default_factory=JobTags)


async def create_jobs_stubs() -> None:
    job_stubs = [
        JobStub(
            org=Org(name="Novafield Labs", website="novafield.ai", is_highlighted=True),
            job=Job(
                title="Research Scientist, Interpretability",
                description="Support and empower AI safety researchers by helping drive impactful work forward and strengthening the overall MATS program.\nPartner with leading mentors to nurture mentees' research capabilities and shepherd AI safety projects through every stage of development.\nAdvise early-career researchers on promising research paths, written outputs, and long-term professional development.\nHelp scholars access key resources and introduce them to subject-matter experts who can advance their work.\nShape MATS strategic direction by leading internal initiatives and enhancing the program's operational foundations.",
                url_external="https://novafield.ai/careers/interpretability",
                salary_min=180_000,
                posted_at=datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
                - timedelta(days=1),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.ML, val.skill.Research, val.skill.Python],
                area=[val.area.AIS],
                education=[val.education.PhD],
                experience=[val.experience.Middle],
                workload=[val.workload.FullTime],
                country=[val.country.US],
                city=[val.city.SF],
                visa_countries=[val.country.US],
            ),
        ),
        JobStub(
            org=Org(name="ClearGrant Foundation", website="cleargrant.org", is_highlighted=True),
            job=Job(
                title="Operations Associate",
                url_external="https://cleargrant.org/jobs/ops-associate",
                salary_min=75_000,
                posted_at=datetime(2026, 2, 1, tzinfo=UTC),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Operations, val.skill.Finance],
                area=[val.area.GlobalHealth],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime],
                country=[val.country.US],
                city=[val.city.Oakland, val.city.SF],
            ),
        ),
        JobStub(
            org=Org(
                name="Meridian Governance Institute",
                website="meridiangovernance.org",
                is_highlighted=True,
            ),
            job=Job(
                title="Policy Researcher, AI Governance",
                description="The Meridian Governance Institute seeks a Policy Researcher to analyze emerging AI governance frameworks across jurisdictions, contribute to policy briefs and reports, and engage with governments and international organisations on AI regulation. Remote-friendly with occasional travel to our offices.",
                url_external="https://meridiangovernance.org/vacancies/policy",
                is_remote=True,
                posted_at=datetime(2026, 1, 9, tzinfo=UTC),
                closes_at=datetime(2026, 5, 15, tzinfo=UTC) + timedelta(days=10),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Policy, val.skill.Research, val.skill.Writing],
                area=[val.area.AIS, val.area.Societal],
                education=[val.education.Masters],
                experience=[val.experience.Junior, val.experience.Middle],
                workload=[val.workload.FullTime],
                country=[val.country.UK, val.country.US],
                city=[
                    val.city.London,
                    val.city.Oxford,
                    val.city.DC,
                    val.city.Geneva,
                    val.city.Brussels,
                ],
                visa_countries=[val.country.UK],
            ),
        ),
        JobStub(
            org=Org(
                name="BridgeFund International", website="bridgefund.io", is_highlighted=True
            ),
            job=Job(
                title="Country Director, East Africa Programs",
                url_external="https://bridgefund.io/hiring/country-director",
                salary_min=90_000,
                salary_max=130_000,
                posted_at=datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Management, val.skill.Operations],
                area=[val.area.GlobalHealth],
                education=[val.education.Undergrad],
                experience=[val.experience.Senior],
                workload=[val.workload.FullTime],
                country=[
                    val.country.Kenya,
                    val.country.Uganda,
                    val.country.Rwanda,
                    val.country.Tanzania,
                    val.country.Malawi,
                    val.country.Mozambique,
                    val.country.DRC,
                ],
                city=[val.city.Nairobi, val.city.Kampala, val.city.Kigali, val.city.DarEsSalaam],
            ),
        ),
        JobStub(
            org=Org(name="Arclight Research Institute", website="arclightresearch.org"),
            job=Job(
                title="Summer Research Fellowship",
                url_external="https://arclightresearch.org/fellowship",
                posted_at=datetime(2026, 2, 15, tzinfo=UTC),
                closes_at=datetime(2026, 3, 31, tzinfo=UTC) + timedelta(days=30),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research, val.skill.ML, val.skill.SWE],
                area=[val.area.AIS],
                education=[val.education.NoReq],
                experience=[val.experience.Entry],
                workload=[val.workload.Internship, val.workload.ThreeMonths],
                country=[val.country.US],
                city=[val.city.Berkeley],
            ),
        ),
        JobStub(
            org=Org(name="Sentient Metrics", website="sentientmetrics.org"),
            job=Job(
                title="Data Analyst, Animal Welfare Metrics",
                url_external="https://sentientmetrics.org/careers/data-analyst",
                is_remote=True,
                posted_at=datetime(2026, 2, 20, tzinfo=UTC),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Data, val.skill.Research, val.skill.SWE],
                area=[val.area.AnimalWelfare],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime, val.workload.PartTime],
                country=[val.country.US, val.country.UK, val.country.Remote],
            ),
        ),
    ]

    orgs = await Org.objects.abulk_create([stub.org for stub in job_stubs])
    for stub, org in zip(job_stubs, orgs):
        stub.job.org = org
    await Job.objects.abulk_create([stub.job for stub in job_stubs])

    for stub in job_stubs:
        for category in TagCategoryEnum:
            if tag_names := getattr(stub.tags, category.value, None):
                tags = await _get_or_create_tags(tag_names, category)
                await getattr(stub.job, f"tags_{category.value}").aset(tags)

        if stub.tags.visa_countries:
            await _create_visa_child_tags(stub.tags.visa_countries)
            country_tags = [
                await PostTag.objects.aget(name=name, tag_parent=None)
                for name in stub.tags.visa_countries
            ]
            await stub.job.tags_country_visa_sponsor.aset(country_tags)

    await _create_draft_version(published=job_stubs[0].job)


async def _create_draft_version(published: Job) -> Job:
    """
    #AI-slop
    """
    draft = await Job.objects.acreate(
        title=f"{published.title} (updated)",
        org=published.org,
        url_external=published.url_external,
        salary_min=(published.salary_min or 0) + 10_000,
        is_remote=True,
        posted_at=published.posted_at,
        visibility=published.visibility,
        is_published=False,
    )
    # Override slug to match published (AutoSlugField generates unique slugs)
    draft.slug = published.slug
    await draft.asave()
    await published.versions.aadd(draft)
    return draft


async def _get_or_create_tags(tag_names: list[str], category: TagCategoryEnum) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for tag_name in tag_names:
        tag, _ = await PostTag.objects.aget_or_create(name=tag_name, tag_parent=None)
        await tag.categories.aadd(category_obj)
        tags.append(tag)
    return tags


async def _create_visa_child_tags(country_names: list[str]) -> None:
    """
    #AI-slop, might be wrong re parent/child rels, as we switched away from it
    """
    visa_category, _ = await PostTagCategory.objects.aget_or_create(
        name=TagCategoryEnum.VisaSponsorship.value
    )
    for country in country_names:
        tag_parent = await PostTag.objects.aget(name=country, tag_parent=None)
        tag_child, _ = await PostTag.objects.aget_or_create(
            name=f"can sponsor visas ({country})",
            tag_parent=tag_parent,
        )
        await tag_child.categories.aadd(visa_category)


class val:
    class country:
        US = "US"
        UK = "UK"
        Kenya = "Kenya"
        Uganda = "Uganda"
        Rwanda = "Rwanda"
        Tanzania = "Tanzania"
        Malawi = "Malawi"
        Mozambique = "Mozambique"
        DRC = "DRC"
        Remote = "Remote"

    class city:
        SF = "SF"
        Oakland = "Oakland"
        Berkeley = "Berkeley"
        London = "London"
        Oxford = "Oxford"
        DC = "Washington DC"
        Geneva = "Geneva"
        Brussels = "Brussels"
        Nairobi = "Nairobi"
        Kampala = "Kampala"
        Kigali = "Kigali"
        DarEsSalaam = "Dar es Salaam"

    class skill:
        ML = "Machine Learning"
        Research = "Research"
        Python = "Python"
        Operations = "Operations"
        Finance = "Finance"
        Policy = "Policy"
        Writing = "Writing"
        Management = "Management"
        SWE = "Software Engineering"
        Data = "Data"

    class area:
        AIS = "AI Safety & Policy"
        GlobalHealth = "Global Health & Development"
        Societal = "Societal Improvements"
        AnimalWelfare = "Animal Welfare"

    class education:
        PhD = "PhD"
        Masters = "Master's degree"
        Undergrad = "Undergrad"
        NoReq = "No education requirement"

    class experience:
        Entry = "Entry-level"
        Junior = "Junior (1-4y)"
        Middle = "Mid (5-9y)"
        Senior = "Senior (10y+)"

    class workload:
        FullTime = "Full-time"
        PartTime = "Part-time"
        Internship = "Internship"
        ThreeMonths = "3 months"
