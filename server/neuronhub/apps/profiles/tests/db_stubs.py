import datetime
import textwrap
from dataclasses import dataclass
from dataclasses import field

from django.conf import settings
from django.utils import timezone

from neuronhub.apps.profiles.models import CareerStage
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.tests.test_gen import Gen


@dataclass
class ProfileStub:
    profile: Profile
    skills: list[str] = field(default_factory=list)
    interests: list[str] = field(default_factory=list)
    career_stage: list[CareerStage] = field(default_factory=list)


async def create_profiles_stubs(gen: Gen):
    group, _ = await ProfileGroup.objects.aget_or_create(name=settings.CONF_CONFIG.eag_group)  # type: ignore[has-type]

    await gen.profiles.profile(user=gen.users.user_default, groups=[group])

    profile_stubs = [
        ProfileStub(
            profile=Profile(
                first_name="Elena",
                last_name="Kowalski",
                company="Clearview Research",
                job_title="Senior Research Analyst",
                biography="I study cost-effectiveness of animal welfare interventions across factory farming, wild animal welfare, and alternative proteins. Previously worked on global health evaluations at a major charity evaluator.",
                seeks="Looking for collaborators on a cross-cause prioritization framework. Also seeking funders for a new farmed fish welfare project.",
                offers="Can help with quantitative research methods, survey design, and cost-effectiveness modeling. Happy to review grant applications.",
            ),
            skills=[val.skill.QuantResearch, val.skill.DataAnalysis],
            interests=[val.interest.AnimalWelfare, val.interest.GlobalHealth],
            career_stage=[CareerStage.Working6to15y, CareerStage.Employed],
        ),
        ProfileStub(
            profile=Profile(
                first_name="Marcus",
                last_name="Chen",
                company="Novafield Labs",
                job_title="AI Safety Researcher",
                biography="Working on scalable oversight and interpretability. PhD from MIT on formal verification of neural networks.",
                seeks="Seeking alignment researchers for a reading group on debate-based oversight protocols.",
                offers=textwrap.dedent("""\
                    I mentor junior AI safety researchers and can provide feedback on technical alignment proposals.
                    I have experience with RLHF, constitutional AI, and mechanistic interpretability.
                    I can connect people with the broader AI safety community in the Bay Area.
                    I also advise on PhD applications for ML safety programs.
                    Available for 1-on-1 career advising calls.
                    Can review papers on interpretability, alignment tax estimation, and scalable oversight.
                    Happy to give talks at university groups about technical AI safety careers.
                    I maintain an open-source library for activation patching experiments that I can help people use."""),
            ),
            skills=[val.skill.ML, val.skill.AISafety],
            interests=[val.interest.AIGovernance, val.interest.DevPolicy],
            career_stage=[CareerStage.Working0to5y, CareerStage.Employed],
        ),
        ProfileStub(
            profile=Profile(
                first_name="Priya",
                last_name="Okonkwo",
                company="BridgeFund International",
                job_title="Country Director, Nigeria",
                biography="Leading cash transfer programs in northern Nigeria. Background in development economics from LSE. Previously managed operations at a large development org across three countries.",
                seeks="Seeking connections with mobile money providers and government officials working on social protection in West Africa.",
            ),
            skills=[val.skill.TeamManagement],
            interests=[val.interest.GlobalHealth, val.interest.DevPolicy],
            career_stage=[CareerStage.Working6to15y, CareerStage.Employed],
        ),
        ProfileStub(
            profile=Profile(
                first_name="James",
                last_name="Forsyth",
                company="Meridian Governance Institute",
                job_title="Policy Fellow",
                biography="Researching international AI governance frameworks. Law degree from Oxford, previously clerked at the ICJ. Interested in how export controls and compute governance interact with safety standards.",
                seeks="Want to connect with people working on AI policy in the EU, UK, and US. Looking for co-authors on a paper about multilateral compute agreements.",
                offers="Can advise on legal frameworks for AI regulation and international law questions.",
            ),
            skills=[val.skill.AIPolicy, val.skill.Law],
            interests=[val.interest.AIGovernance, val.interest.AISafety],
            career_stage=[CareerStage.Working0to5y, CareerStage.Employed],
        ),
        ProfileStub(
            profile=Profile(
                first_name="Tomoko",
                last_name="Sato",
                job_title="Independent Researcher",
                biography="Studying s-risks and suffering-focused ethics. Writing a book on the moral weight of digital minds. Previously a philosophy lecturer at Kyoto University for 8 years.",
                seeks="Seeking a research position at an aligned org focused on digital sentience or AI welfare. Also open to consulting.",
                offers="Deep knowledge of philosophy of mind, consciousness research, and moral uncertainty frameworks.",
            ),
            skills=[
                val.skill.Philosophy,
                val.skill.Academic,
                val.skill.Writing,
            ],
            interests=[
                val.interest.DigitalSentience,
                val.interest.AnimalWelfare,
                val.interest.GlobalPriorities,
            ],
            career_stage=[CareerStage.Working15yPlus, CareerStage.UnemployedLooking],
        ),
        ProfileStub(
            profile=Profile(
                first_name="David",
                last_name="Müller",
                company="Altruistic Giving Switzerland",
                job_title="Executive Director",
                biography="Built a Swiss giving platform from scratch. We've moved $12M to top charities since 2021.",
                seeks="Want to learn from other community builders, especially those running national groups.",
                offers="Can share our fundraising playbook and donor management systems.",
            ),
            skills=[val.skill.Fundraising, val.skill.Nonprofit, val.skill.CommunityBuilding],
            interests=[val.interest.GlobalHealth, val.interest.GlobalPriorities],
            career_stage=[CareerStage.Working6to15y, CareerStage.SelfEmployed],
        ),
    ]

    now = timezone.now()

    for index, stub in enumerate(profile_stubs):
        profile = await gen.profiles.profile(
            groups=[group],
            first_name=stub.profile.first_name,
            last_name=stub.profile.last_name,
            company=stub.profile.company,
            job_title=stub.profile.job_title,
            biography=stub.profile.biography,
            seeks=stub.profile.seeks,
            offers=stub.profile.offers,
            skills=stub.skills or None,
            interests=stub.interests or None,
            career_stage=stub.career_stage,
        )
        await Profile.objects.filter(pk=profile.pk).aupdate(
            created_at=now - datetime.timedelta(hours=6 - index),
        )

    for index, (llm_score, user_score) in enumerate([(90, 20), (50, 80), (20, 50)]):
        profile = await gen.profiles.profile(groups=[group])
        await Profile.objects.filter(pk=profile.pk).aupdate(
            created_at=now - datetime.timedelta(hours=3 - index),
        )
        await gen.profiles.match(
            profile=profile,
            user=gen.users.user_default,
            score_by_llm=llm_score,
            score_by_user=user_score,
        )


class val:
    class skill:
        QuantResearch = "Quantitative Research"
        DataAnalysis = "Data Analysis"
        ML = "Machine Learning"
        AISafety = "AI Safety"
        TeamManagement = "Team Management"
        AIPolicy = "AI Policy"
        Law = "International Law"
        Philosophy = "Philosophy of Mind"
        Academic = "Academic Research"
        Writing = "Technical Writing"
        Fundraising = "Fundraising"
        Nonprofit = "Nonprofit Management"
        CommunityBuilding = "Community Building"

    class interest:
        AnimalWelfare = "Animal Welfare"
        GlobalHealth = "Global Health"
        AIGovernance = "AI Governance"
        DevPolicy = "Development Policy"
        AISafety = "AI Safety"
        DigitalSentience = "Digital Sentience"
        GlobalPriorities = "Global Priorities"
