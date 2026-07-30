"""
The canonical [[JobsLandingPage]] rows - data only, no logic, and the source of truth
for the set.

Adding or renaming a page touches only this file. [[landing_pages_seed]] consumes it.
"""

from dataclasses import dataclass
from dataclasses import field

from neuronhub.apps.orgs.models import OrgTypeEnum
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum


@dataclass
class LandingPageSpec:
    slug: str
    # Filled verbatim into the `{label}` title/meta templates, so it must read as a
    # standalone plural noun - the H1 appends `that are good for you and for the world.`
    label: str
    area_names: list[str] = field(default_factory=list)
    skill_names: list[str] = field(default_factory=list)
    experience_names: list[str] = field(default_factory=list)
    workload_names: list[str] = field(default_factory=list)
    location_names: list[str] = field(default_factory=list)
    org_type: OrgTypeEnum | None = None

    @property
    def names_by_tag_category(self) -> dict[TagCategoryEnum, list[str]]:
        return {
            TagCategoryEnum.Area: self.area_names,
            TagCategoryEnum.Skill: self.skill_names,
            TagCategoryEnum.Experience: self.experience_names,
            TagCategoryEnum.Workload: self.workload_names,
        }


def build_landing_page_specs() -> list[LandingPageSpec]:
    """
    Flat, not generated: the same filter is named differently per page (`Global Health
    & Development` standalone vs `Global Health` when crossed), and crosses read two
    ways (`Entry-level AI Safety Jobs` vs `Operations Jobs in AI Safety`), so no
    composition rule reproduces the names.
    """
    return [
        LandingPageSpec("climate", "Impactful Climate Change Jobs", area_names=_prod.climate),
        LandingPageSpec(
            "remote-climate",
            "Impactful Remote Climate Change Jobs",
            area_names=_prod.climate,
            location_names=_prod.remote,
        ),
        LandingPageSpec("ai-safety", "Impactful AI Safety Jobs", area_names=_prod.ai_safety),
        LandingPageSpec(
            "remote-ai-safety",
            "Impactful Remote AI Safety Jobs",
            area_names=_prod.ai_safety,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "biosecurity", "Impactful Biosecurity Jobs", area_names=_prod.biosecurity
        ),
        LandingPageSpec(
            "global-health-development",
            "Impactful Global Health & Development Jobs",
            area_names=_prod.ghd,
        ),
        LandingPageSpec(
            "remote-global-health-development",
            "Impactful Remote Global Health Jobs",
            area_names=_prod.ghd,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "washington-dc",
            "Impactful Jobs in Washington D.C.",
            location_names=["Washington D.C., USA"],
        ),
        LandingPageSpec(
            "san-francisco",
            "Impactful Jobs in San Francisco",
            location_names=["San Francisco CA, USA"],
        ),
        LandingPageSpec("london", "Impactful Jobs in London", location_names=["London, UK"]),
        LandingPageSpec(
            "nyc", "Impactful Jobs in New York City", location_names=["New York NY, USA"]
        ),
        LandingPageSpec(
            "new-delhi", "Impactful Jobs in New Delhi", location_names=["New Delhi, India"]
        ),
        LandingPageSpec(
            "nairobi", "Impactful Jobs in Nairobi", location_names=["Nairobi, Kenya"]
        ),
        LandingPageSpec("internships", "Impactful Internships", workload_names=["Internship"]),
        LandingPageSpec("fellowships", "Impactful Fellowships", workload_names=["Fellowship"]),
        LandingPageSpec(
            "part-time",
            "Impactful Part-time Jobs",
            workload_names=["Part-Time (<50% FTE)", "Part-Time (50–80% FTE)"],
        ),
        LandingPageSpec(
            "entry-level", "Impactful Entry-level Jobs", experience_names=_prod.entry_level
        ),
        LandingPageSpec(
            "remote-entry-level",
            "Impactful Remote Entry-level Jobs",
            experience_names=_prod.entry_level,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "entry-level-ai-safety",
            "Impactful Entry-level AI Safety Jobs",
            experience_names=_prod.entry_level,
            area_names=_prod.ai_safety,
        ),
        LandingPageSpec(
            "entry-level-animal-welfare",
            "Impactful Entry-level Animal Welfare Jobs",
            experience_names=_prod.entry_level,
            area_names=_prod.animal_welfare,
        ),
        LandingPageSpec(
            "entry-level-climate",
            "Impactful Entry-level Climate Change Jobs",
            experience_names=_prod.entry_level,
            area_names=_prod.climate,
        ),
        LandingPageSpec(
            "entry-level-biosecurity",
            "Impactful Entry-level Biosecurity Jobs",
            experience_names=_prod.entry_level,
            area_names=_prod.biosecurity,
        ),
        LandingPageSpec(
            "entry-level-global-health-development",
            "Impactful Entry-level Global Health Jobs",
            experience_names=_prod.entry_level,
            area_names=_prod.ghd,
        ),
        LandingPageSpec("junior", "Impactful Junior-level Jobs", experience_names=_prod.junior),
        LandingPageSpec(
            "remote-junior",
            "Impactful Remote Junior-level Jobs",
            experience_names=_prod.junior,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "junior-ai-safety",
            "Impactful Junior-level AI Safety Jobs",
            experience_names=_prod.junior,
            area_names=_prod.ai_safety,
        ),
        LandingPageSpec(
            "junior-animal-welfare",
            "Impactful Junior-level Animal Welfare Jobs",
            experience_names=_prod.junior,
            area_names=_prod.animal_welfare,
        ),
        LandingPageSpec(
            "junior-climate",
            "Impactful Junior-level Climate Change Jobs",
            experience_names=_prod.junior,
            area_names=_prod.climate,
        ),
        LandingPageSpec(
            "junior-biosecurity",
            "Impactful Junior-level Biosecurity Jobs",
            experience_names=_prod.junior,
            area_names=_prod.biosecurity,
        ),
        LandingPageSpec(
            "junior-global-health-development",
            "Impactful Junior-level Global Health Jobs",
            experience_names=_prod.junior,
            area_names=_prod.ghd,
        ),
        LandingPageSpec(
            "communications", "Impactful Communications Jobs", skill_names=_prod.communications
        ),
        LandingPageSpec(
            "remote-communications",
            "Impactful Remote Communications Jobs",
            skill_names=_prod.communications,
            location_names=_prod.remote,
        ),
        LandingPageSpec("data", "Impactful Data Jobs", skill_names=_prod.data),
        LandingPageSpec(
            "remote-data",
            "Impactful Remote Data Jobs",
            skill_names=_prod.data,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "engineering", "Impactful Engineering Jobs", skill_names=_prod.engineering
        ),
        LandingPageSpec(
            "remote-engineering",
            "Impactful Remote Engineering Jobs",
            skill_names=_prod.engineering,
            location_names=_prod.remote,
        ),
        LandingPageSpec("finance", "Impactful Finance Jobs", skill_names=_prod.finance),
        LandingPageSpec(
            "remote-finance",
            "Impactful Remote Finance Jobs",
            skill_names=_prod.finance,
            location_names=_prod.remote,
        ),
        LandingPageSpec("management", "Impactful Management Jobs", skill_names=_prod.management),
        LandingPageSpec(
            "remote-management",
            "Impactful Remote Management Jobs",
            skill_names=_prod.management,
            location_names=_prod.remote,
        ),
        LandingPageSpec("operations", "Impactful Operations Jobs", skill_names=_prod.operations),
        LandingPageSpec(
            "remote-operations",
            "Impactful Remote Operations Jobs",
            skill_names=_prod.operations,
            location_names=_prod.remote,
        ),
        LandingPageSpec("policy", "Impactful Policy Jobs", skill_names=_prod.policy),
        LandingPageSpec(
            "remote-policy",
            "Impactful Remote Policy Jobs",
            skill_names=_prod.policy,
            location_names=_prod.remote,
        ),
        LandingPageSpec("research", "Impactful Research Jobs", skill_names=_prod.research),
        LandingPageSpec(
            "remote-research",
            "Impactful Remote Research Jobs",
            skill_names=_prod.research,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "software-engineering",
            "Impactful Software Engineering Jobs",
            skill_names=_prod.software_engineering,
        ),
        LandingPageSpec(
            "remote-software-engineering",
            "Impactful Remote Software Engineering Jobs",
            skill_names=_prod.software_engineering,
            location_names=_prod.remote,
        ),
        LandingPageSpec(
            "operations-ai-safety",
            "Impactful Operations Jobs in AI Safety",
            skill_names=_prod.operations,
            area_names=_prod.ai_safety,
        ),
        LandingPageSpec(
            "operations-animal-welfare",
            "Impactful Operations Jobs in Animal Welfare",
            skill_names=_prod.operations,
            area_names=_prod.animal_welfare,
        ),
        LandingPageSpec(
            "operations-climate",
            "Impactful Operations Jobs in Climate Change",
            skill_names=_prod.operations,
            area_names=_prod.climate,
        ),
        LandingPageSpec(
            "operations-biosecurity",
            "Impactful Operations Jobs in Biosecurity",
            skill_names=_prod.operations,
            area_names=_prod.biosecurity,
        ),
        LandingPageSpec(
            "operations-global-health-development",
            "Impactful Operations Jobs in Global Health",
            skill_names=_prod.operations,
            area_names=_prod.ghd,
        ),
        LandingPageSpec(
            "government", "Impactful Government Jobs", org_type=OrgTypeEnum.GOVERNMENT
        ),
        LandingPageSpec(
            "university", "Impactful University Jobs", org_type=OrgTypeEnum.UNIVERSITY
        ),
        LandingPageSpec(
            "multinational",
            "Impactful Jobs at Multinational Organizations",
            org_type=OrgTypeEnum.INTERNATIONAL_INSTITUTION,
        ),
    ]


class _prod:
    ai_safety = ["AI Safety & Policy"]
    animal_welfare = ["Animal Welfare"]
    biosecurity = ["Biosecurity"]
    climate = ["Climate Change"]
    ghd = ["Global Health & Development"]
    entry_level = ["Entry-Level"]
    junior = ["Junior (1–4y)"]
    communications = ["Communications & Outreach"]
    data = ["Data"]
    engineering = ["Engineering"]
    finance = ["Finance"]
    management = ["Management"]
    operations = ["Operations"]
    policy = ["Policy"]
    research = ["Research"]
    software_engineering = ["Software Engineering"]
    remote = ["Remote, USA", "Remote, Global"]
