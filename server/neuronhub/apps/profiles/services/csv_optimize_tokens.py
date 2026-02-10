import re

from neuronhub.apps.profiles.models import CareerStage


def csv_optimize_tokens(csv_raw: str) -> str:
    for originals, replacement in config.replacements:
        if isinstance(originals, str):
            originals = [originals]
        for original in originals:
            pattern = re.escape(original).replace("/", r"\s*/\s*")
            csv_raw = re.compile(pattern, re.IGNORECASE).sub(replacement, csv_raw)
    return csv_raw


class config:
    replacements: list[tuple[str | list[str], str]] = [
        (["‘", "’"], "'"),
        (["•	", "•  "], "- "),
        (["https://", "www."], ""),
        (
            [
                "The Centre for Effective Altruism",
                "Centre for Effective Altruism",
                "Center for Effective Altruism",
            ],
            "CEA",
        ),
        ("Giving What We Can", "GWWC"),
        ("Open Philanthropy", "OpenPhil"),
        ("BlueDot Impact", "BlueDot"),
        (["80,000 Hours", "80000 Hours", "80 000 Hours"], "80k Hours"),
        ("I'm actively looking for a new role", "looking for a new role"),
        (
            "I'm happy where I am but feel free to pitch me new ideas",
            "happy where I am; open to new ideas",
        ),
        ("I'm not interested in a new role", "interested in a new role"),
        (
            "I'm interested in changing my job but not actively looking",
            "interested in jobs, but not looking",
        ),
        (
            "I'm seeking collaborators for an existing project/research",
            "seeking collaborators for a project",
        ),
        ("Not employed, but looking", CareerStage.UnemployedLooking),
        ("Employed, full-time", CareerStage.Employed),
        ("Self employed", CareerStage.SelfEmployed),
        (
            ["Pursuing a doctoral degree (e.g. PhD)", "Pursuing a doctoral"],
            CareerStage.PhDStudent,
        ),
        (
            ["Pursuing a graduate degree (e.g. Masters)", "Pursuing a graduate degree"],
            CareerStage.GradStudent,
        ),
        (["Pursuing an undergraduate degree", "Pursuing an undergrad"], CareerStage.Undergrad),
        ("Working (6–15 years of experience)", CareerStage.Working6to15y),
        ("Working (0–5 years experience)", CareerStage.Working0to5y),
        ("Working (15+ years of experience)", CareerStage.Working15yPlus),
        (
            ["Improving institutional decision making", "Institutional decision making"],
            "Institutional decisions",
        ),
        ("Civilisational recovery/resilience", "Civilisational resilience"),
        ("Global coordination & peace-building", "Global coordination"),
        ("Global mental health & well-being", "Global mental health"),
        ("Global health & development", "Global health"),
        ("Global priorities research", "Global priorities"),
        ("Climate change mitigation", "Climate change"),
        (["Farmed animal welfare", "Wild animal welfare"], "Animal welfare"),
        ("China-Western relations", "China-West"),
        (
            [
                "Software development/Software engineering",
                "Software EngineeringSoftware Engineer",
            ],
            "SWE",
        ),
        ("Data science/Data visualization", "Data science"),
        (["AI safety technical research", "AI-safety", "AI Safety"], "AIS"),
        (["Project management/Program management", "Project management"], "PM"),
        ("EA community building/community management", "EA community building"),
        ("User experience design/research", "UX"),
        ("Policymaking/Civil service", "Policymaking"),
        ("Machine Learning", "ML"),
        ("Information security", "Infosec"),
        ("Finance/Accounting", "Finance"),
        ("Healthcare/Medicine", "Healthcare"),
        ("HR/People operations", "HR"),
        ("AI strategy & policy", "AI policy"),
        ("Academic research", "Academia"),
        ("global catastrophic risk", "GCR"),
        ("existential risk", "x-risk"),
        ("a Software Engineer", "an SWE"),
        ("large language model", "LLM"),
        ("reinforcement learning", "RL"),
        ("deep learning", "DL"),
        ("artificial intelligence", "AI"),
        ("Chief Technology Officer", "CTO"),
        ("Chief Operating Officer", "COO"),
        ("United Kingdom", "UK"),
        (["United States", "U.S."], "US"),
        ("San Francisco", "SF"),
        (["Washington, DC", "Washington DC", "D.C."], "DC"),
        ("Los Angeles", "LA"),
        ("New York", "NY"),
        ("Effective Altruism", "EA"),
        # empty values
        ("N/A", ""),
        ("\u200b", ""),
    ]
