from dataclasses import dataclass

from asgiref.sync import sync_to_async
from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.profiles.models import CareerStage
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.users.models import User


@dataclass
class ProfilesGen:
    faker: UniqueProxy
    user: User

    async def group(self, name: str = "") -> ProfileGroup:
        group, _ = await ProfileGroup.objects.aget_or_create(
            name=name or self.faker.company(),
        )
        return group

    async def invite(self, profile: Profile, user_email: str = "") -> ProfileInvite:
        return await ProfileInvite.objects.acreate(
            profile=profile,
            user_email=user_email or self.faker.email(),
        )

    async def profile(
        self,
        user: User | None = None,
        first_name: str = "",
        last_name: str = "",
        career_stage: list[CareerStage] | None = None,
        visibility: Visibility = Visibility.PUBLIC,
        visible_to_users: list[User] | None = None,
        groups: list[ProfileGroup] | None = None,
        company: str = "",
        job_title: str = "",
        biography: str = "",
        skills: list[str] | None = None,
        interests: list[str] | None = None,
        seeks: str = "",
        offers: str = "",
    ) -> Profile:
        profile = await Profile.objects.acreate(
            user=user,
            first_name=first_name or self.faker.first_name(),
            last_name=last_name or self.faker.last_name(),
            company=company or self.faker.company(),
            job_title=job_title or self.faker.job(),
            career_stage=career_stage or [],
            biography=biography or self.faker.text(max_nb_chars=200),
            seeks=seeks or self.faker.sentence(),
            offers=offers,
            visibility=visibility,
        )

        if skills or interests:
            tag_skill_parent, _ = await PostTag.objects.aget_or_create(
                name="Skill", tag_parent=None
            )
        else:
            tag_skill_parent = None

        if skills:
            tag_skills = [
                (await PostTag.objects.aget_or_create(name=tag, tag_parent=tag_skill_parent))[0]
                for tag in skills
            ]
            await profile.skills.aset(tag_skills)

        if interests:
            tag_interests = [
                (await PostTag.objects.aget_or_create(name=tag, tag_parent=tag_skill_parent))[0]
                for tag in interests
            ]
            await profile.interests.aset(tag_interests)

        profile.match_hash = await sync_to_async(profile.compute_content_hash)()
        await profile.asave()

        if visible_to_users:
            await profile.visible_to_users.aset(visible_to_users)

        if groups:
            await profile.groups.aset(groups)

        return profile

    async def match(
        self,
        profile: Profile,
        user: User = None,
        score_by_llm: int | None = None,
        reason_by_llm: str = "",
        score_by_user: int | None = None,
        review_by_user: str = "",
    ) -> ProfileMatch:
        match, _ = await ProfileMatch.objects.aupdate_or_create(
            user=user or self.user,
            profile=profile,
            defaults={
                "match_score_by_llm": score_by_llm,
                "match_reason_by_llm": reason_by_llm,
                "match_score": score_by_user,
                "match_review": review_by_user,
            },
        )
        return match
