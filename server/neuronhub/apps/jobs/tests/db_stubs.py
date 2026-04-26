"""
#quality-25% #AI
"""

import textwrap
from datetime import timedelta

from asgiref.sync import sync_to_async
from django.db.models import QuerySet
from django.utils import timezone

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.airtable_sync_jobs import JobParsed
from neuronhub.apps.jobs.services.airtable_sync_jobs import LocationParsed
from neuronhub.apps.jobs.services.airtable_sync_jobs import _parse_location_field
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_jobs_parsed_to_drafts
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_gen import Gen


async def create_jobs_stubs(gen: Gen) -> None:
    await _create_orgs()

    await _sync_jobs_parsed_to_drafts(_build_jobs_parsed())
    await Job.objects.filter(is_published=False).aupdate(is_published=True)

    # create ~6 drafts:
    await gen.jobs.job_draft()
    await gen.jobs.job_draft()
    jobs_qs = Job.objects.select_related("org")
    async for job in jobs_qs.order_by("id")[:2]:
        await gen.jobs.job_draft(job, title=f"{job.title} (updated)")
    async for job in jobs_qs.order_by("-id")[:2]:
        await gen.jobs.job_draft(job=job, is_pending_removal=True)


async def _create_orgs() -> None:
    await Org.objects.abulk_create(
        [
            _orgs.novafield,
            _orgs.cleargrant,
            _orgs.meridian,
            _orgs.bridgefund,
            _orgs.arclight,
            _orgs.climateworks,
            _orgs.nti,
            _orgs.rethink,
        ],
        ignore_conflicts=True,
    )


@sync_to_async
def slice_qs(qs: QuerySet, end: int) -> QuerySet:
    return qs[:end]


def _build_jobs_parsed() -> list[JobParsed]:
    now = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    url_ext_duplicate = "https://meridiangovernance.org/vacancies/policy"

    return [
        JobParsed(
            title="Research Scientist, Interpretability",
            url_external="https://novafield.ai/careers/interpretability",
            org_name=_orgs.novafield.name,
            description=textwrap.dedent("""
                - Drive impactful AI safety research projects
                - Partner with mentors to nurture mentees
                - Advise early-career researchers on promising research paths
            """),
            source_ext=Job.SourceExt.AIM,
            salary_min=180_000,
            salary_text="$155,741 – $163,529",
            posted_at=now - timedelta(days=1),
            locations=_locations("San Francisco CA, United States"),
            tags_skill=[val.skill.ML, val.skill.Research, val.skill.Python],
            tags_area=[val.area.AIS, val.area.CareerCapital],
            tags_education=[val.edu.Masters],
            tags_experience=[val.experience.Middle],
            tags_workload=[val.workload.FullTime],
            tags_country_visa_sponsor=[val.country.US],
        ),
        JobParsed(
            title="Operations Associate",
            url_external="https://cleargrant.org/jobs/ops-associate",
            org_name=_orgs.cleargrant.name,
            description=textwrap.dedent("""
                - Coordinate day-to-day grant operations
                - Maintain internal databases and reporting dashboards
                - Support the finance team with budget tracking
            """),
            source_ext=Job.SourceExt.AIM,
            salary_min=75_000,
            posted_at=now - timedelta(days=37),
            locations=_locations("Oakland CA, United States", "Washington DC, United States"),
            tags_skill=[val.skill.Operations, val.skill.Finance],
            tags_area=[val.area.GlobalHealth, val.area.ProfitForGood],
            tags_education=[val.edu.Undergrad],
            tags_experience=[val.experience.Junior],
            tags_workload=[val.workload.FullTime, val.workload.PartTimeSub50],
        ),
        JobParsed(
            title="Policy Researcher (Earlier Posting)",
            url_external=url_ext_duplicate,
            org_name=_orgs.meridian.name,
            description="Earlier listing for the same role.",
            posted_at=now - timedelta(days=120),
            locations=_locations("London, United Kingdom"),
            tags_skill=[val.skill.Policy],
            tags_area=[val.area.AIS],
            tags_experience=[val.experience.Junior],
            tags_workload=[val.workload.FullTime],
            is_duplicate_url_valid=True,
        ),
        JobParsed(
            title="Policy Researcher, AI Governance",
            url_external=url_ext_duplicate,
            org_name=_orgs.meridian.name,
            description=textwrap.dedent("""
                - Analyze emerging AI governance frameworks across jurisdictions
                - Contribute to policy briefs for governments
                - Engage with policymakers on AI regulation
            """),
            salary_text="$50,000 – $140,000; £37,500 – £105,000",
            posted_at=now - timedelta(days=60),
            closes_at=now + timedelta(days=66),
            locations=_locations("London, United Kingdom", "Remote, United Kingdom"),
            tags_skill=[val.skill.Policy, val.skill.Research, val.skill.Writing],
            tags_area=[val.area.AIS, val.area.Societal],
            tags_education=[val.edu.Masters],
            tags_experience=[val.experience.Junior, val.experience.Middle],
            tags_workload=[val.workload.FullTime, val.workload.PartTime50],
            tags_country_visa_sponsor=[val.country.UK],
        ),
        JobParsed(
            title="Country Director, East Africa Programs",
            url_external="https://bridgefund.io/hiring/country-director",
            org_name=_orgs.bridgefund.name,
            description=textwrap.dedent("""
                - Lead policy-relevant research on macroeconomic management in African contexts
                - Advise governments on economic transformation strategies
                - Build partnerships with funders and local organisations
            """),
            salary_min=84_984,
            salary_text="$7,200; €6,100; £5,400 per month",
            posted_at=now,
            locations=_locations("Nairobi, Kenya"),
            tags_skill=[val.skill.Operations, val.skill.Policy],
            tags_area=[val.area.GlobalHealth],
            tags_education=[val.edu.Undergrad],
            tags_experience=[val.experience.Senior],
            tags_workload=[val.workload.FullTime],
        ),
        JobParsed(
            title="Summer Research Fellowship",
            url_external="https://arclightresearch.org/fellowship",
            org_name=_orgs.arclight.name,
            description=textwrap.dedent("""
                - Join a 10-week intensive on alignment and interpretability
                - Work alongside senior researchers with dedicated mentorship
                - Present findings at an end-of-programme symposium
            """),
            salary_text="$10,000 stipend",
            posted_at=now - timedelta(days=23),
            closes_at=now + timedelta(days=21),
            locations=_locations("Berkeley CA, United States"),
            tags_skill=[val.skill.Research, val.skill.ML, val.skill.SWE],
            tags_area=[val.area.AIS, val.area.CareerCapital],
            tags_education=[val.edu.Undergrad],
            tags_experience=[val.experience.Entry],
            tags_workload=[val.workload.Fellowship],
        ),
        JobParsed(
            title="Senior Communications Manager",
            url_external="https://climateworks.org/careers/senior-comms-manager",
            org_name=_orgs.climateworks.name,
            description=textwrap.dedent("""
                - Lead external communications strategy across channels
                - Translate complex climate science for general audiences
                - Manage relationships with journalists and partners
            """),
            salary_min=110_000,
            salary_text="$110,000 – $130,000",
            posted_at=now - timedelta(days=4),
            locations=_locations("San Francisco CA, United States", "Remote, United States"),
            tags_skill=[val.skill.Communications, val.skill.Writing],
            tags_area=[val.area.ClimateChange],
            tags_education=[val.edu.Masters],
            tags_experience=[val.experience.Senior],
            tags_workload=[val.workload.FullTime],
        ),
        JobParsed(
            title="Legal Counsel, Arms Control",
            url_external="https://nti.org/careers/legal-counsel-arms-control",
            org_name=_orgs.nti.name,
            description=textwrap.dedent("""
                - Provide legal analysis on arms control treaties
                - Draft policy memoranda for senior leadership
                - Monitor legislative and regulatory developments
            """),
            salary_min=130_000,
            salary_text="$130,000 – $155,000",
            posted_at=now - timedelta(days=12),
            locations=_locations("Washington DC, United States"),
            tags_skill=[val.skill.Legal, val.skill.Policy],
            tags_area=[val.area.NuclearSecurity],
            tags_education=[val.edu.PhD],
            tags_experience=[val.experience.Senior],
            tags_workload=[val.workload.FullTime],
        ),
        JobParsed(
            title="Research Associate (Expression of Interest)",
            url_external="https://rethinkpriorities.org/eoi",
            org_name=_orgs.rethink.name,
            description=textwrap.dedent("""
                - Conduct research across animal welfare and AI safety
                - Write findings in clear, accessible reports
                - Contribute to forecasting and prioritisation exercises
            """),
            posted_at=now - timedelta(days=2),
            locations=_locations(
                "Remote, Global", "Remote, United States", "Remote, United Kingdom"
            ),
            tags_skill=[val.skill.Research],
            tags_area=[val.area.AIS, val.area.AnimalWelfare],
            tags_experience=[val.experience.Junior],
            tags_workload=[val.workload.ExpressionOfInterest],
        ),
    ]


def _locations(*loc_names: str) -> list[LocationParsed]:
    return _parse_location_field(", ".join(f'"{loc_name}"' for loc_name in loc_names))


class _orgs:
    novafield = Org(
        name="Novafield Labs",
        website="https://novafield.ai",
        description="AI safety lab focused on mechanistic interpretability.",
        is_highlighted=True,
    )
    cleargrant = Org(
        name="ClearGrant Foundation",
        website="https://cleargrant.org",
        description="Philanthropy funding global health and development projects.",
        is_highlighted=True,
    )
    meridian = Org(
        name="Meridian Governance Institute",
        website="https://meridiangovernance.org",
        description="Policy think tank on responsible AI governance.",
    )
    bridgefund = Org(
        name="BridgeFund International",
        website="https://bridgefund.io",
        description="Development NGO running health and education programmes across Africa.",
    )
    arclight = Org(
        name="Arclight Research Institute",
        website="https://arclightresearch.org",
        description="Fellowship programmes for aspiring alignment researchers.",
    )
    climateworks = Org(
        name="ClimateWorks Foundation",
        website="https://climateworks.org",
        description="Funds and accelerates solutions to the climate crisis.",
        is_highlighted=True,
    )
    nti = Org(
        name="Nuclear Threat Initiative",
        website="https://nti.org",
        description="Prevents catastrophic attacks with weapons of mass destruction.",
        is_highlighted=True,
    )
    rethink = Org(
        name="Rethink Priorities",
        website="https://rethinkpriorities.org",
        description="Research to inform effective giving and career decisions.",
    )


class val:
    class country:
        US = "United States"
        UK = "United Kingdom"

    class skill:
        Communications = "Communications & Outreach"
        Finance = "Finance"
        Legal = "Legal"
        ML = "Machine Learning"
        Operations = "Operations"
        Policy = "Policy"
        Python = "Python"
        Research = "Research"
        SWE = "Software Engineering"
        Writing = "Writing"

    class area:
        AIS = "AI Safety & Policy"
        AnimalWelfare = "Animal Welfare"
        CareerCapital = Job.Tags.CareerCapital.value
        ClimateChange = "Climate Change"
        GlobalHealth = "Global Health & Development"
        NuclearSecurity = "Nuclear Security & Conflict"
        ProfitForGood = Job.Tags.ProfitForGood.value
        Societal = "Societal Improvements"

    class edu:
        Undergrad = "Undergraduate Degree or Less"
        Masters = "Master's Degree"
        PhD = "Doctoral Degree"

    class experience:
        Entry = "Entry-Level"
        Junior = "Junior (1–4y)"
        Middle = "Mid (5–9y)"
        Senior = "Senior (10y+)"

    class workload:
        FullTime = "Full-Time"
        PartTime50 = "Part-Time (50–80% FTE)"
        PartTimeSub50 = "Part-Time (<50% FTE)"
        Fellowship = "Fellowship"
        ExpressionOfInterest = "Expression of Interest"
