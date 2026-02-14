import re
from dataclasses import dataclass


@dataclass(slots=True)
class R:
    """Replacement rule. `db` not None → also applied during CSV import for Algolia facets."""

    raw: str | list[str]
    llm: str = ""
    db: str | None = None
    replace_all: str | None = None

    def __post_init__(self):
        if self.replace_all is not None:
            self.llm = self.replace_all
            self.db = self.replace_all


_replacements: list[R] = [
    R(raw=["'", "\u2019"], replace_all="'"),
    # todo ! regex for `^{num}) ?` -> `{num}. `
    # todo ! regex for newlines with ^()
    # more patterns to replace: ["^--"]
    R(raw=["•\t", "•  ", "• ", "— "], replace_all="- "),
    R(raw="https://", llm=""),
    R(raw="www.", replace_all=""),
    R(
        raw=[
            "The Centre for Effective Altruism",
            "Centre for Effective Altruism",
            "Center for Effective Altruism",
        ],
        db="Centre for Effective Altruism",
        llm="CEA",
    ),
    R(raw="Giving What We Can", llm="GWWC"),
    R(raw="Open Philanthropy", llm="OpenPhil"),
    R(raw="BlueDot Impact", llm="BlueDot"),
    R(raw=["80,000 Hours", "80000 Hours", "80 000 Hours"], db="80,000 Hours", llm="80k Hours"),
    R(raw="I'm actively looking for a new role", replace_all="looking for a new role"),
    R(
        raw="I'm happy where I am but feel free to pitch me new ideas",
        replace_all="happy where I am; open to new ideas",
    ),
    R(raw="I'm not interested in a new role", replace_all="not interested in a new role"),
    R(
        raw="I'm interested in changing my job but not actively looking",
        replace_all="interested in jobs, but not looking",
    ),
    R(
        raw="I'm seeking collaborators for an existing project/research",
        replace_all="seeking collaborators for a project",
    ),
    # recruitment
    R(raw="I'm actively hiring for a senior role(s)", replace_all="actively hiring seniors"),
    R(raw="I'm actively hiring for mid-level role(s)", replace_all="actively hiring mid-levels"),
    R(
        raw="I'm actively hiring for junior/entry-level role(s)",
        replace_all="actively hiring for juniors",
    ),
    R(
        raw="I expect to be hiring in the next 3–6 months",
        replace_all="expect to be hiring in 3-6m",
    ),
    R(
        raw="I'm looking to start a new project and seeking co-founders/collaborators",
        replace_all="planing a new project & seeking co-founders/collaborators",
    ),
    R(
        raw="I have funding/resources and am seeking people to lead projects",
        replace_all="have funding and seeking project leads",
    ),
    R(raw="Not employed, but looking", replace_all="Not employed, looking"),
    R(raw="Employed, full-time", replace_all="Employed"),
    R(raw="Self employed", replace_all="Self-employed"),
    R(
        raw=["Pursuing a doctoral degree (e.g. PhD)", "Pursuing a doctoral"],
        replace_all="PhD student",
    ),
    R(
        raw=["Pursuing a graduate degree (e.g. Masters)", "Pursuing a graduate degree"],
        replace_all="Grad student",
    ),
    R(
        raw=["Pursuing an undergraduate degree", "Pursuing an undergrad"],
        replace_all="Undergrad",
    ),
    R(raw="Working (6–15 years of experience)", replace_all="Working 6-15y"),
    R(raw="Working (0–5 years experience)", replace_all="Working 0-5y"),
    R(raw="Working (15+ years of experience)", replace_all="Working 15y+"),
    R(
        raw=["Improving institutional decision making", "Institutional decision making"],
        replace_all="Institutional decisions",
    ),
    R(raw="Civilisational recovery/resilience", replace_all="Civilisational resilience"),
    R(
        raw="Global coordination & peace-building",
        llm="Global coordination",
        db="Global coordination & peace",
    ),
    R(raw="Global mental health & well-being", replace_all="Global mental health"),
    R(raw="Global health & development", llm="Global health", db="Global health & dev"),
    R(raw="Global priorities research", replace_all="Global priorities"),
    R(raw="Climate change mitigation", replace_all="Climate change"),
    R(raw="China-Western relations", replace_all="China-Western rels"),
    R(
        raw=[
            "Software development/Software engineering",
            "Software EngineeringSoftware Engineer",
        ],
        llm="SWE",
        db="Software Engineering",
    ),
    R(raw="Data science/Data visualization", llm="Data science"),
    R(raw=["AI-safety", "AI Safety"], db="AI Safety"),
    R(raw=["AI safety technical research", "AI-safety", "AI Safety"], llm="AIS"),
    R(
        raw=["Project management/Program management", "Project management"],
        llm="PM",
        db="Project management",
    ),
    R(raw="EA community building/community management", llm="EA community building"),
    R(raw="User experience design/research", replace_all="UX"),
    R(raw="Policymaking/Civil service", replace_all="Policymaking"),
    R(raw="Machine Learning", llm="ML"),
    R(raw="Information security", llm="Infosec"),
    R(raw="Finance/Accounting", llm="Finance"),
    R(raw="Healthcare/Medicine", replace_all="Healthcare"),
    R(raw="HR/People operations", llm="HR"),
    R(raw="AI strategy & policy", llm="AI policy"),
    R(raw="Academic research", llm="Academia"),
    R(raw="global catastrophic risk", llm="GCR"),
    R(raw="existential risk", llm="x-risk"),
    R(raw="a Software Engineer", llm="an SWE"),
    R(raw="large language model", llm="LLM"),
    R(raw="reinforcement learning", llm="RL"),
    R(raw="deep learning", llm="DL"),
    R(raw="artificial intelligence", llm="AI"),
    R(raw="Chief Technology Officer", llm="CTO"),
    R(raw="Chief Operating Officer", llm="COO"),
    R(raw="San Francisco", llm="SF"),
    R(raw=["Washington, DC", "Washington DC", "D.C."], llm="DC"),
    R(raw="Los Angeles", llm="LA"),
    R(raw="New York", llm="NY"),
    R(raw="Effective Altruism", llm="EA"),
    # countries
    R(raw="United Kingdom", replace_all="UK"),
    R(raw=["United States", "U.S."], replace_all="US"),
    # empty values
    R(raw="N/A", llm=""),
    R(raw="\u200b", llm=""),
]


def csv_optimize_tokens(text: str) -> str:
    """All abbreviations for LLM token optimization."""
    for r in _replacements:
        text = _apply(text, r.raw, r.llm)
    return text


def csv_normalize_for_db(text: str) -> str:
    """Normalize for DB storage and Algolia facets."""
    for r in _replacements:
        if r.db is not None:
            text = _apply(text, r.raw, r.db)
    return text


def _apply(text: str, originals: str | list[str], replacement: str) -> str:
    if isinstance(originals, str):
        originals = [originals]
    for original in originals:
        pattern = re.escape(original).replace("/", r"\s*/\s*")
        text = re.compile(pattern, re.IGNORECASE).sub(replacement, text)
    return text
