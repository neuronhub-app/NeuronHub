"""
#quality-21% #AI-slop
"""

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


@dataclass(frozen=True)
class LocationVal:
    name: str
    city: str = ""
    country: str = ""
    region: str = ""
    is_remote: bool = False


@dataclass
class JobTags:
    skill: list[str] = field(default_factory=list)
    area: list[str] = field(default_factory=list)
    education: list[str] = field(default_factory=list)
    experience: list[str] = field(default_factory=list)
    workload: list[str] = field(default_factory=list)
    visa_countries: list[str] = field(default_factory=list)


@dataclass
class JobStub:
    job: Job
    org: Org
    tags: JobTags = field(default_factory=JobTags)
    locations: list[LocationVal] = field(default_factory=list)


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
                salary_text="$180,000 – $220,000",
                posted_at=now - timedelta(days=1),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.ML, val.skill.Research, val.skill.Python],
                area=[val.area.AIS, val.area.CareerCapital],
                education=[val.education.Masters],
                experience=[val.experience.Middle],
                workload=[val.workload.FullTime],
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
                salary_text="$75,000 – $90,000",
                posted_at=now - timedelta(days=37),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Operations, val.skill.Finance],
                area=[val.area.GlobalHealth, val.area.ProfitForGood],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime, val.workload.PartTimeSub50],
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
                salary_min=50_000,
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
                salary_min=86_400,
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
                salary_min=10_000,
                salary_text="$10,000 stipend",
                posted_at=now - timedelta(days=23),
                closes_at=now + timedelta(days=21),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research, val.skill.ML, val.skill.SWE],
                area=[val.area.AIS, val.area.CareerCapital],
                education=[val.education.Undergrad],
                experience=[val.experience.Entry],
                workload=[val.workload.Fellowship],
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
                description=textwrap.dedent("""
                    - Conduct independent research on a topic within AI safety, biosecurity, or global health
                    - Produce a written report or paper suitable for public dissemination
                    - Engage with Open Philanthropy program staff for feedback and direction
                    - Present findings at an end-of-grant seminar
                """),
                url_external="https://openphil.org/grants/research-analyst",
                posted_at=now - timedelta(days=5),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.AIS],
                experience=[val.experience.Junior],
                workload=[val.workload.Funding],
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
                description=textwrap.dedent("""
                    - Coordinate volunteer recruitment, onboarding, and scheduling for EA London events
                    - Maintain relationships with regular volunteers and support their development
                    - Help organise monthly meetups, workshops, and speaker events
                    - Track volunteer hours and produce quarterly impact reports
                """),
                url_external="https://ealon.org/volunteer",
                posted_at=now - timedelta(days=10),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Operations],
                area=[val.area.Societal],
                experience=[val.experience.Entry],
                workload=[val.workload.Volunteer],
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
                description=textwrap.dedent("""
                    - Complete a structured 12-month curriculum covering AI safety fundamentals and research methods
                    - Work on a supervised research project with a senior mentor
                    - Attend weekly seminars and reading groups with peers and faculty
                    - Build professional networks across the AI safety community
                """),
                url_external="https://futureleaders.org/graduate",
                posted_at=now - timedelta(days=14),
                closes_at=now + timedelta(days=30),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.AIS],
                experience=[val.experience.Entry],
                workload=[val.workload.GraduateProgram],
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
                description=textwrap.dedent("""
                    - Participate in an intensive 5-day training on pandemic risk assessment and response
                    - Learn frameworks for outbreak detection, containment, and international coordination
                    - Engage in tabletop exercises simulating real-world biosecurity scenarios
                    - Network with public health professionals and policymakers from 20+ countries
                """),
                url_external="https://bstn.org/training",
                posted_at=now - timedelta(days=3),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Policy],
                area=[val.area.Biosecurity],
                experience=[val.experience.Junior],
                workload=[val.workload.Training],
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
                description=textwrap.dedent("""
                    - Support the policy team in tracking legislative developments relevant to animal welfare
                    - Draft briefing documents, summaries, and stakeholder communications
                    - Assist with research on regulatory frameworks across US states and federal agencies
                    - Attend coalition meetings and take notes for internal distribution
                """),
                url_external="https://humaneventures.org/internship",
                salary_min=24_000,
                salary_text="$2,000 per month",
                posted_at=now - timedelta(days=8),
                closes_at=now + timedelta(days=14),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Policy],
                area=[val.area.AnimalWelfare],
                experience=[val.experience.Entry],
                workload=[val.workload.Internship],
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
                description=textwrap.dedent("""
                    - Conduct quantitative and qualitative research across cause areas including animal welfare and AI safety
                    - Write up findings in clear, accessible reports for a general EA audience
                    - Collaborate with senior researchers on ongoing projects
                    - Contribute to internal forecasting and prioritisation exercises
                """),
                url_external="https://rethinkpriorities.org/eoi",
                posted_at=now - timedelta(days=2),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.AIS, val.area.AnimalWelfare],
                experience=[val.experience.Junior],
                workload=[val.workload.ExpressionOfInterest],
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
                description=textwrap.dedent("""
                    - Research and summarise evidence on charity effectiveness for the GWWC knowledge base
                    - Write accessible articles and explainers for a general audience
                    - Fact-check and update existing content based on new evidence
                    - Collaborate asynchronously with the full-time research team
                """),
                url_external="https://givingwhatwecan.org/roles/research",
                posted_at=now - timedelta(days=6),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Research],
                area=[val.area.GlobalHealth],
                experience=[val.experience.Entry],
                workload=[val.workload.PartTime50, val.workload.PartTimeSub50],
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
                salary_min=37_440,
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
            ),
            locations=[
                val.location.SanFranciscoCA,
                val.location.LondonUK,
                val.location.RemoteUSA,
                val.location.RemoteUK,
            ],
        ),
        JobStub(
            org=Org(
                name="ClimateWorks Foundation",
                website="https://climateworks.org",
                description="ClimateWorks Foundation funds and accelerates solutions to the climate crisis, working with philanthropists and partners to mobilise resources for high-impact climate action.",
                is_highlighted=True,
            ),
            job=Job(
                title="Senior Communications Manager",
                description=textwrap.dedent("""
                    - Lead external communications strategy across digital, media, and stakeholder channels
                    - Develop compelling narratives that translate complex climate science for general audiences
                    - Manage relationships with journalists, partner organisations, and spokespeople
                    - Oversee production of reports, press releases, and campaign materials
                """),
                url_external="https://climateworks.org/careers/senior-comms-manager",
                salary_min=110_000,
                salary_text="$110,000 – $130,000",
                posted_at=now - timedelta(days=4),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Communications, val.skill.Writing],
                area=[val.area.ClimateChange],
                education=[val.education.Masters],
                experience=[val.experience.Senior],
                workload=[val.workload.FullTime],
            ),
            locations=[val.location.SanFranciscoCA, val.location.RemoteUSA],
        ),
        JobStub(
            org=Org(
                name="Center for Healthy Minds",
                website="https://centerhealthyminds.org",
                description="The Center for Healthy Minds investigates the science of wellbeing and develops evidence-based programmes to reduce suffering and promote flourishing at scale.",
            ),
            job=Job(
                title="Research Engineer, Wellbeing Technology",
                description=textwrap.dedent("""
                    - Build and maintain data pipelines for large-scale wellbeing research studies
                    - Develop software tools for ecological momentary assessment and mobile data collection
                    - Collaborate with neuroscientists and psychologists to implement study protocols
                    - Contribute to open-source tooling used across the research community
                """),
                url_external="https://centerhealthyminds.org/jobs/research-engineer",
                salary_min=95_000,
                salary_text="$95,000 – $115,000",
                posted_at=now - timedelta(days=9),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Engineering, val.skill.SWE],
                area=[val.area.MentalHealth],
                education=[val.education.PhD],
                experience=[val.experience.Middle],
                workload=[val.workload.FullTime],
            ),
            locations=[val.location.RemoteUSA],
        ),
        JobStub(
            org=Org(
                name="Nuclear Threat Initiative",
                website="https://nti.org",
                description="NTI works to prevent catastrophic attacks and accidents with weapons of mass destruction and disruption — nuclear, biological, chemical, radiological, and now cyber.",
                is_highlighted=True,
            ),
            job=Job(
                title="Legal Counsel, Arms Control",
                description=textwrap.dedent("""
                    - Provide legal analysis on international arms control treaties and non-proliferation regimes
                    - Draft policy memoranda and legal opinions for senior leadership and government partners
                    - Monitor legislative and regulatory developments relevant to nuclear security
                    - Support negotiation preparation for multilateral forums and UN bodies
                """),
                url_external="https://nti.org/careers/legal-counsel-arms-control",
                salary_min=130_000,
                salary_text="$130,000 – $155,000",
                posted_at=now - timedelta(days=12),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Legal, val.skill.Policy],
                area=[val.area.NuclearSecurity],
                education=[val.education.PhD],
                experience=[val.experience.Senior],
                workload=[val.workload.FullTime],
            ),
            locations=[val.location.WashingtonDC],
        ),
        JobStub(
            org=Org(
                name="Effective Giving UK",
                website="https://effectivegiving.uk",
                description="Effective Giving UK is a community-building organisation that runs outreach programmes, giving circles, and local chapters to grow the effective altruism community across the UK.",
            ),
            job=Job(
                title="Community Builder, University Outreach",
                description=textwrap.dedent("""
                    - Launch and support EA chapters at UK universities
                    - Run workshops, fellowships, and speaker events for students
                    - Provide coaching and resources to student chapter leaders
                    - Track engagement metrics and report on community growth
                """),
                url_external="https://effectivegiving.uk/jobs/community-builder",
                posted_at=now - timedelta(days=7),
                closes_at=now + timedelta(days=45),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.Communications],
                area=[val.area.CommunityBuilding],
                education=[val.education.Undergrad],
                experience=[val.experience.Entry],
                workload=[val.workload.FullTime],
            ),
            locations=[val.location.LondonUK, val.location.OxfordUK],
        ),
        JobStub(
            org=Org(
                name="Founders Pledge",
                website="https://founderspledge.com",
                description="Founders Pledge helps entrepreneurs and investors maximise their impact by pledging to give a portion of their proceeds to effective causes.",
            ),
            job=Job(
                title="Information Security Analyst",
                description=textwrap.dedent("""
                    - Monitor and respond to security events across cloud and on-premise infrastructure
                    - Conduct vulnerability assessments and penetration testing on internal systems
                    - Maintain security policies, incident response procedures, and staff training materials
                    - Liaise with external auditors and ensure compliance with relevant data protection regulations
                """),
                url_external="https://founderspledge.com/careers/infosec-analyst",
                salary_min=85_000,
                salary_text="$85,000 – $100,000",
                posted_at=now - timedelta(days=16),
                visibility=Visibility.PUBLIC,
            ),
            tags=JobTags(
                skill=[val.skill.InfoSec, val.skill.Engineering],
                area=[val.area.Other],
                education=[val.education.Undergrad],
                experience=[val.experience.Junior],
                workload=[val.workload.FullTime],
            ),
            locations=[val.location.LondonUK, val.location.RemoteUK],
        ),
    ]

    orgs = await Org.objects.abulk_create([stub.org for stub in job_stubs])
    for job_stub, org in zip(job_stubs, orgs):
        job_stub.job.org = org
    await Job.objects.abulk_create([stub.job for stub in job_stubs])

    # todo ! refac: trash comp in comp; give normal names as in code-style-detailed.md
    location_vals_all = {loc_val for stub in job_stubs for loc_val in stub.locations}
    locations_by_val = await _create_locations(location_vals_all)

    for job_stub in job_stubs:
        for category, tag_field_name in Job.tag_category_to_field.items():
            if tag_names := getattr(job_stub.tags, category.value, None):
                tags = await _get_or_create_tags(tag_names, category)
                await getattr(job_stub.job, tag_field_name).aset(tags)

        if job_stub.tags.visa_countries:
            # Country tags must exist for visa child tags
            await _get_or_create_tags(job_stub.tags.visa_countries, TagCategoryEnum.Country)
            await _create_visa_child_tags(job_stub.tags.visa_countries)
            country_tags = [
                await PostTag.objects.aget(name=name, tag_parent=None)
                for name in job_stub.tags.visa_countries
            ]
            await job_stub.job.tags_country_visa_sponsor.aset(country_tags)

        if job_stub.locations:
            await job_stub.job.locations.aset(
                [locations_by_val[loc_val] for loc_val in job_stub.locations]
            )

    await _create_draft_version(published=job_stubs[0].job)


async def _create_jobs(gen: Gen, now) -> None:
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
            posted_at=now - timedelta(days=random_seeded.randint(1, 90)),
            closes_at=now + timedelta(days=random_seeded.randint(10, 120))
            if random_seeded.random() > 0.5
            else None,
        )

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
        posted_at=published.posted_at,
        visibility=published.visibility,
        is_published=False,
    )
    # Override slug to match published (AutoSlugField generates unique slugs)
    draft.slug = published.slug
    await draft.asave()
    await published.versions.aadd(draft)
    return draft


async def _create_locations(location_vals: set[LocationVal]) -> dict[LocationVal, JobLocation]:
    await JobLocation.objects.abulk_create(
        [
            JobLocation(
                name=lv.name,
                city=lv.city,
                country=lv.country,
                region=lv.region,
                is_remote=lv.is_remote,
            )
            for lv in location_vals
        ],
        ignore_conflicts=True,
    )
    names = [lv.name for lv in location_vals]
    db_by_name = {loc.name: loc async for loc in JobLocation.objects.filter(name__in=names)}
    return {lv: db_by_name[lv.name] for lv in location_vals}


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


class _country:
    US = "United States"
    UK = "United Kingdom"
    Kenya = "Kenya"


class _region:
    Global = "Global"
    NA = "North America"
    EU = "Western Europe"
    SubSaharanAfrica = "Sub-Saharan Africa"


class val:
    country = _country

    class skill:
        Communications = "Communications & Outreach"
        Data = "Data"
        Engineering = "Engineering"
        Finance = "Finance"
        InfoSec = "Information Security"
        Legal = "Legal"
        ML = "Machine Learning"
        Management = "Management"
        Operations = "Operations"
        Policy = "Policy"
        Python = "Python"
        Research = "Research"
        SWE = "Software Engineering"
        Writing = "Writing"

    class area:
        AIS = "AI Safety & Policy"
        AnimalWelfare = "Animal Welfare"
        Biosecurity = "Biosecurity"
        CareerCapital = "Career Capital"
        ClimateChange = "Climate Change"
        CommunityBuilding = "Community Building"
        GlobalHealth = "Global Health & Development"
        MentalHealth = "Mental Health & Wellbeing"
        NuclearSecurity = "Nuclear Security & Conflict"
        Other = "Other"
        ProfitForGood = "Profit for Good"
        Societal = "Societal Improvements"

    class education:
        Undergrad = "Undergraduate Degree or Less"
        Masters = "Master's Degree"
        PhD = "Doctoral Degree"

    class experience:
        Entry = "Entry-Level"
        Junior = "Junior (1-4 years experience)"
        Middle = "Mid (5-9 years experience)"
        Senior = "Senior (10+ years experience)"

    class location:
        RemoteGlobal = LocationVal("Remote, Global", region=_region.Global, is_remote=True)
        RemoteUSA = LocationVal(
            "Remote, USA", country=_country.US, region=_region.NA, is_remote=True
        )
        RemoteUK = LocationVal(
            "Remote, UK", country=_country.UK, region=_region.EU, is_remote=True
        )
        RemoteEurope = LocationVal("Remote, Europe", region=_region.EU, is_remote=True)
        SanFranciscoCA = LocationVal(
            "San Francisco CA, USA",
            city="San Francisco CA",
            country=_country.US,
            region=_region.NA,
        )
        WashingtonDC = LocationVal(
            "Washington DC, USA",
            city="Washington D.C.",
            country=_country.US,
            region=_region.NA,
        )
        LondonUK = LocationVal(
            "London, UK", city="London", country=_country.UK, region=_region.EU
        )
        NairobiKenya = LocationVal(
            "Nairobi, Kenya",
            city="Nairobi",
            country=_country.Kenya,
            region=_region.SubSaharanAfrica,
        )
        BerkeleyCA = LocationVal(
            "Berkeley CA, USA",
            city="Berkeley CA",
            country=_country.US,
            region=_region.NA,
        )
        OaklandCA = LocationVal(
            "Oakland CA, USA",
            city="Oakland CA",
            country=_country.US,
            region=_region.NA,
        )
        OxfordUK = LocationVal(
            "Oxford, UK", city="Oxford", country=_country.UK, region=_region.EU
        )

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
