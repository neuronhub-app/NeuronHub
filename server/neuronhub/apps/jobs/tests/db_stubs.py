import textwrap
from dataclasses import dataclass
from dataclasses import field
from datetime import timedelta

from django.utils import timezone

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory
from neuronhub.apps.tests.test_gen import Gen


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
    locations: list[str] = field(default_factory=list)


async def create_jobs_stubs(gen: Gen) -> None:
    now = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    job_stubs = [
        JobStub(
            org=Org(
                name="Novafield Labs",
                website="https://novafield.ai",
                description="Novafield Labs is an AI safety research lab focused on mechanistic interpretability and alignment. They develop tools and techniques for understanding the internal representations of neural networks.",
                is_highlighted=True,
            ),
            job=Job(
                title="Research Scientist, Interpretability",
                description=textwrap.dedent("""
                    - Support and empower AI safety researchers by helping drive impactful work forward
                    - Partner with leading mentors to nurture mentees' research capabilities
                    - Advise early-career researchers on promising research paths and professional development
                    - Help scholars access key resources and connect with subject-matter experts
                    - Shape MATS strategic direction by leading internal initiatives
                """),
                url_external="https://novafield.ai/careers/interpretability",
                salary_min=180_000,
                salary_text="$155,741 – $163,529",
                posted_at=now - timedelta(days=1),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.ML, val.skill.Research, val.skill.Python],
                area=[val.area.AIS, val.area.CareerCapital],
                education=[val.education.PhD],
                experience=[val.experience.Middle],
                workload=[val.workload.FullTime],
                country=[val.country.US],
                city=[val.city.SanFrancisco],
                visa_countries=[val.country.US],
            ),
            locations=[val.location.SanFranciscoCA],
        ),
        JobStub(
            org=Org(
                name="ClearGrant Foundation",
                website="https://cleargrant.org",
                description="ClearGrant Foundation is a philanthropic organisation that funds high-impact global health and development projects. They manage a portfolio of grants across multiple continents with a focus on measurable outcomes.",
                is_highlighted=True,
            ),
            job=Job(
                title="Operations Associate",
                description=textwrap.dedent("""
                    - Coordinate day-to-day grant operations including scheduling, logistics, and vendor management
                    - Maintain internal databases and reporting dashboards for active grants portfolio
                    - Support the finance team with budget tracking, expense reconciliation, and quarterly reporting
                    - Liaise with grantee organisations to ensure timely deliverables and compliance
                """),
                url_external="https://cleargrant.org/jobs/ops-associate",
                salary_min=75_000,
                posted_at=now - timedelta(days=37),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Operations, val.skill.Finance],
                area=[val.area.GlobalHealth, val.area.ProfitForGood],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime, val.workload.PartTimeSub50],
                country=[val.country.US],
                city=[val.city.Oakland, val.city.SanFrancisco],
            ),
            locations=[
                val.location.OaklandCA,
                val.location.SanFranciscoCA,
                val.location.WashingtonDC,
            ],
        ),
        JobStub(
            org=Org(
                name="Meridian Governance Institute",
                website="https://meridiangovernance.org",
                description="Meridian Governance Institute is a policy think tank that researches and advocates for responsible AI governance. They work with governments and international bodies to develop regulatory frameworks for advanced AI systems.",
            ),
            job=Job(
                title="Policy Researcher, AI Governance",
                description=textwrap.dedent("""
                    - Analyze emerging AI governance frameworks across jurisdictions
                    - Contribute to policy briefs and reports for governments and international organisations
                    - Engage with policymakers on AI regulation and safety standards
                    - Remote-friendly with occasional travel to offices
                """),
                url_external="https://meridiangovernance.org/vacancies/policy",
                is_remote=True,
                salary_text="$50,000 – $140,000; £37,500 – £105,000",
                posted_at=now - timedelta(days=60),
                closes_at=now + timedelta(days=66),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Policy, val.skill.Research, val.skill.Writing],
                area=[val.area.AIS, val.area.Societal],
                education=[val.education.Masters],
                experience=[val.experience.Junior, val.experience.Middle],
                workload=[
                    val.workload.FullTime,
                    val.workload.PartTime50,
                    val.workload.PartTimeSub50,
                ],
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
            locations=[
                val.location.LondonUK,
                val.location.OxfordUK,
                val.location.WashingtonDC,
                val.location.RemoteUK,
            ],
        ),
        JobStub(
            org=Org(
                name="BridgeFund International",
                website="https://bridgefund.io",
                description="BridgeFund International is a development NGO that designs and implements health and education programmes across East and Southern Africa. They partner with local governments and community organisations to deliver sustainable interventions.",
            ),
            job=Job(
                title="Country Director, East Africa Programs",
                description=textwrap.dedent("""
                    A research fellowship contributing to policy analysis on economic management and governance issues facing African countries.
                    - Conduct policy-relevant research on macroeconomic management, fiscal policy, governance, or institutional reform in African contexts.
                    - Contribute to ACET's advisory work supporting governments in their economic transformation strategies.
                    - This is placeholder text generated using only the job title and organization as a guide.
                """),
                url_external="https://bridgefund.io/hiring/country-director",
                salary_min=84_984,
                salary_text="$7,200; €6,100; £5,400 per month",
                posted_at=now,
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
            locations=[
                val.location.NairobiKenya,
                val.location.LondonUK,
                val.location.WashingtonDC,
                val.location.SanFranciscoCA,
            ],
        ),
        JobStub(
            org=Org(
                name="Arclight Research Institute",
                website="https://arclightresearch.org",
                description="Arclight Research Institute runs intensive fellowship programmes for aspiring alignment researchers. They provide mentorship, compute resources, and a collaborative environment for early-career scientists working on AI safety.",
            ),
            job=Job(
                title="Summer Research Fellowship",
                description=textwrap.dedent("""
                    - Join a 10-week intensive programme working on alignment and interpretability projects
                    - Work alongside senior researchers with dedicated mentorship and compute resources
                    - Present findings at an end-of-programme symposium
                    - Open to undergrads, grad students, and early-career researchers from any discipline
                """),
                url_external="https://arclightresearch.org/fellowship",
                salary_text="$10,000 stipend",
                posted_at=now - timedelta(days=23),
                closes_at=now + timedelta(days=21),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research, val.skill.ML, val.skill.SWE],
                area=[val.area.AIS, val.area.CareerCapital],
                education=[val.education.NoReq],
                experience=[val.experience.Entry],
                workload=[val.workload.Fellowship],
                country=[val.country.US],
                city=[val.city.Berkeley],
            ),
            locations=[val.location.BerkeleyCA],
        ),
        JobStub(
            org=Org(
                name="OpenPhil Grantmaking",
                website="https://openphil.org",
                description="Open Philanthropy is a grant-making organisation that funds research and projects across global health, AI safety, and biosecurity.",
            ),
            job=Job(
                title="Research Analyst Grant (Funding Opportunity)",
                url_external="https://openphil.org/grants/research-analyst",
                posted_at=now - timedelta(days=5),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                area=[val.area.AIS],
                workload=[val.workload.Funding],
                country=[val.country.US],
            ),
            locations=[val.location.RemoteUSA],
        ),
        JobStub(
            org=Org(
                name="EA London",
                website="https://ealon.org",
                description="EA London runs community events, training programmes, and volunteer initiatives for the effective altruism community.",
            ),
            job=Job(
                title="Community Volunteer Coordinator",
                url_external="https://ealon.org/volunteer",
                posted_at=now - timedelta(days=10),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                area=[val.area.Societal],
                workload=[val.workload.Volunteer],
                country=[val.country.UK],
                city=[val.city.London],
            ),
            locations=[val.location.LondonUK],
        ),
        JobStub(
            org=Org(
                name="Future Leaders Institute",
                website="https://futureleaders.org",
                description="Future Leaders Institute runs graduate programmes and training courses for aspiring leaders in high-impact careers.",
            ),
            job=Job(
                title="AI Safety Graduate Program",
                url_external="https://futureleaders.org/graduate",
                posted_at=now - timedelta(days=14),
                closes_at=now + timedelta(days=30),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                area=[val.area.AIS],
                workload=[val.workload.GraduateProgram],
                country=[val.country.UK],
                city=[val.city.Oxford],
            ),
            locations=[val.location.OxfordUK],
        ),
        JobStub(
            org=Org(
                name="Biosecurity Training Network",
                website="https://bstn.org",
                description="BSTN provides professional training in biosecurity, pandemic preparedness, and global health security.",
            ),
            job=Job(
                title="Pandemic Preparedness Training Course",
                url_external="https://bstn.org/training",
                posted_at=now - timedelta(days=3),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                area=[val.area.GlobalHealth],
                workload=[val.workload.Training],
                country=[val.country.US, val.country.UK],
            ),
            locations=[val.location.RemoteUSA, val.location.RemoteUK, val.location.RemoteEurope],
        ),
        JobStub(
            org=Org(
                name="Humane Ventures",
                website="https://humaneventures.org",
                description="Humane Ventures is an animal welfare accelerator running an internship programme for students interested in high-impact careers.",
            ),
            job=Job(
                title="Policy Internship",
                url_external="https://humaneventures.org/internship",
                salary_text="$2,000 per month",
                posted_at=now - timedelta(days=8),
                closes_at=now + timedelta(days=14),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Policy],
                area=[val.area.AnimalWelfare],
                workload=[val.workload.Internship],
                country=[val.country.US],
                city=[val.city.SanFrancisco],
            ),
            locations=[val.location.SanFranciscoCA],
        ),
        JobStub(
            org=Org(
                name="Rethink Priorities",
                website="https://rethinkpriorities.org",
                description="Rethink Priorities conducts research to inform effective giving and career decisions across multiple cause areas.",
            ),
            job=Job(
                title="Research Associate (Expression of Interest)",
                url_external="https://rethinkpriorities.org/eoi",
                posted_at=now - timedelta(days=2),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.AIS, val.area.AnimalWelfare],
                workload=[val.workload.ExpressionOfInterest],
                country=[val.country.Remote],
            ),
            locations=[
                val.location.RemoteGlobal,
                val.location.RemoteUSA,
                val.location.RemoteUK,
                val.location.RemoteEurope,
            ],
        ),
        JobStub(
            org=Org(
                name="Giving What We Can",
                website="https://givingwhatwecan.org",
                description="Giving What We Can is a community of effective givers, offering part-time research and advocacy roles.",
            ),
            job=Job(
                title="Research Contributor (Part-Time)",
                url_external="https://givingwhatwecan.org/roles/research",
                posted_at=now - timedelta(days=6),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.GlobalHealth],
                workload=[val.workload.PartTime50, val.workload.PartTimeSub50],
                country=[val.country.Remote],
            ),
            locations=[val.location.RemoteGlobal],
        ),
        JobStub(
            org=Org(
                name="Sentient Metrics",
                website="https://sentientmetrics.org",
                description="Sentient Metrics is a research nonprofit that collects and analyses data on farmed animal welfare outcomes worldwide. They produce open datasets and policy briefs used by advocacy organisations and regulators.",
            ),
            job=Job(
                title="Data Analyst, Animal Welfare Metrics",
                description=textwrap.dedent("""
                    - Build and maintain dashboards tracking welfare outcomes across farmed animal populations
                    - Analyze large datasets from field surveys, audits, and partner organisations
                    - Write reproducible analysis pipelines in Python and SQL
                    - Collaborate with researchers to translate findings into policy recommendations
                """),
                url_external="https://sentientmetrics.org/careers/data-analyst",
                is_remote=True,
                salary_text="$18 – $20 per hour",
                posted_at=now - timedelta(days=18),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Data, val.skill.Research, val.skill.SWE],
                area=[val.area.AnimalWelfare, val.area.ProfitForGood],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime, val.workload.PartTime50],
                country=[val.country.US, val.country.UK, val.country.Remote],
            ),
            locations=[
                val.location.SanFranciscoCA,
                val.location.LondonUK,
                val.location.RemoteUSA,
                val.location.RemoteUK,
            ],
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

        if stub.locations:
            locations = await _get_or_create_locations(stub.locations)
            await stub.job.locations.aset(locations)

    await _create_draft_version(published=job_stubs[0].job)


async def _create_random_jobs(gen: Gen, now) -> None:
    """
    #AI
    """
    random_seeded = gen.random_gen_seeded

    for _ in range(5):
        org, _ = await Org.objects.aget_or_create(
            name=gen.faker.company(),
            defaults={
                "website": gen.faker.domain_name(),
                "description": gen.faker.text(max_nb_chars=180),
            },
        )
        job = await gen.jobs.job(
            org=org,
            title=gen.faker.job(),
            description=gen.faker.text(max_nb_chars=300),
            salary_min=random_seeded.choice([None, 60_000, 80_000, 100_000, 120_000]),
            is_remote=random_seeded.choice([None, True, False]),
            posted_at=now - timedelta(days=random_seeded.randint(1, 90)),
            closes_at=now + timedelta(days=random_seeded.randint(10, 120))
            if random_seeded.random() > 0.5
            else None,
        )

        countries_all = [value for value in vars(val.country).values() if isinstance(value, str)]
        country_tags = await _get_or_create_tags(
            random_seeded.sample(countries_all, k=random_seeded.randint(1, 3)),
            TagCategoryEnum.Country,
        )
        await job.tags_country.aset(country_tags)

        areas_all = [value for value in vars(val.area).values() if isinstance(value, str)]
        area_tags = await _get_or_create_tags(
            random_seeded.sample(areas_all, k=random_seeded.randint(1, 2)), TagCategoryEnum.Area
        )
        await job.tags_area.aset(area_tags)


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


async def _get_or_create_locations(location_names: list[str]) -> list[JobLocation]:
    locations = []
    for name in location_names:
        loc, _ = await JobLocation.objects.aget_or_create(
            name=name, defaults=_location_defaults[name]
        )
        locations.append(loc)
    return locations


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
        US = "United States"
        UK = "United Kingdom"
        Kenya = "Kenya"
        Uganda = "Uganda"
        Rwanda = "Rwanda"
        Tanzania = "Tanzania"
        Malawi = "Malawi"
        Mozambique = "Mozambique"
        DRC = "DRC"
        Remote = "Remote"

    class city:
        SanFrancisco = "San Francisco"
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
        CareerCapital = "Career Capital"
        ProfitForGood = "Profit for Good"

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

    class location:
        RemoteGlobal = "Remote, Global"
        RemoteUSA = "Remote, USA"
        RemoteUK = "Remote, UK"
        RemoteEurope = "Remote, Europe"
        SanFranciscoCA = "San Francisco CA, USA"
        WashingtonDC = "Washington D.C., USA"
        LondonUK = "London, UK"
        NairobiKenya = "Nairobi, Kenya"
        BerkeleyCA = "Berkeley CA, USA"
        OaklandCA = "Oakland CA, USA"
        OxfordUK = "Oxford, UK"

    class workload:
        FullTime = "Full-Time"
        PartTime50 = "Part-Time (50–80% FTE)"
        PartTimeSub50 = "Part-Time (<50% FTE)"
        Internship = "Internship"
        Fellowship = "Fellowship"
        Volunteer = "Volunteer"
        Funding = "Funding"
        Training = "Training"
        GraduateProgram = "Graduate Program"
        ExpressionOfInterest = "Expression of Interest"


_location_defaults: dict[str, dict] = {
    val.location.RemoteGlobal: {
        "city": "",
        "country": "",
        "region": "Global",
        "is_remote": True,
    },
    val.location.RemoteUSA: {
        "city": "",
        "country": "United States",
        "region": "North America",
        "is_remote": True,
    },
    val.location.RemoteUK: {
        "city": "",
        "country": "United Kingdom",
        "region": "Western Europe",
        "is_remote": True,
    },
    val.location.RemoteEurope: {
        "city": "",
        "country": "",
        "region": "Western Europe",
        "is_remote": True,
    },
    val.location.SanFranciscoCA: {
        "city": "San Francisco CA",
        "country": "United States",
        "region": "North America",
        "is_remote": False,
    },
    val.location.WashingtonDC: {
        "city": "Washington D.C.",
        "country": "United States",
        "region": "North America",
        "is_remote": False,
    },
    val.location.LondonUK: {
        "city": "London",
        "country": "United Kingdom",
        "region": "Western Europe",
        "is_remote": False,
    },
    val.location.NairobiKenya: {
        "city": "Nairobi",
        "country": "Kenya",
        "region": "Sub-Saharan Africa",
        "is_remote": False,
    },
    val.location.BerkeleyCA: {
        "city": "Berkeley CA",
        "country": "United States",
        "region": "North America",
        "is_remote": False,
    },
    val.location.OaklandCA: {
        "city": "Oakland CA",
        "country": "United States",
        "region": "North America",
        "is_remote": False,
    },
    val.location.OxfordUK: {
        "city": "Oxford",
        "country": "United Kingdom",
        "region": "Western Europe",
        "is_remote": False,
    },
}
