from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.profiles.services.get_sorted_by_match import (
    get_profiles_queryset_sorted_by_match,
)
from neuronhub.apps.tests.test_cases import NeuronTestCase


# #AI
class GetSortedByMatchTest(NeuronTestCase):
    async def test_sorted_by_llm_score_desc(self):
        p_high = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p_mid = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p_low = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)

        await self.gen.profiles.match(p_high, user=self.user, score_by_llm=90)
        await self.gen.profiles.match(p_mid, user=self.user, score_by_llm=50)
        await self.gen.profiles.match(p_low, user=self.user, score_by_llm=10)

        qs = get_profiles_queryset_sorted_by_match(self.user, sort="llm_score")
        ids = [p.id async for p in qs]

        assert ids == [p_high.id, p_mid.id, p_low.id]

    async def test_sorted_by_user_score_desc(self):
        p_high = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p_low = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)

        await self.gen.profiles.match(p_high, user=self.user, score_by_user=80)
        await self.gen.profiles.match(p_low, user=self.user, score_by_user=20)

        qs = get_profiles_queryset_sorted_by_match(self.user, sort="user_score")
        ids = [p.id async for p in qs]

        assert ids == [p_high.id, p_low.id]

    async def test_unscored_profiles_sorted_last(self):
        p_scored = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p_unscored = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)

        await self.gen.profiles.match(p_scored, user=self.user, score_by_llm=50)

        qs = get_profiles_queryset_sorted_by_match(self.user, sort="llm_score")
        ids = [p.id async for p in qs]

        assert await qs.acount() == 2
        assert ids[0] == p_scored.id
        assert ids[1] == p_unscored.id

    async def test_respects_visibility(self):
        other_user = await self.gen.users.user()
        await self.gen.profiles.profile(visibility=Visibility.PRIVATE, user=other_user)
        p_public = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)

        await self.gen.profiles.match(p_public, user=self.user, score_by_llm=10)

        qs = get_profiles_queryset_sorted_by_match(self.user, sort="llm_score")

        assert await qs.acount() == 1
        assert (await qs.afirst()).id == p_public.id

    async def test_other_users_matches_ignored(self):
        """Matches from other users don't affect sort order."""
        other_user = await self.gen.users.user()
        p1 = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p2 = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)

        await self.gen.profiles.match(p1, user=other_user, score_by_llm=99)
        await self.gen.profiles.match(p2, user=self.user, score_by_llm=80)

        qs = get_profiles_queryset_sorted_by_match(self.user, sort="llm_score")
        ids = [p.id async for p in qs]

        # p2 first (current user's score=80), p1 has no score for current user (sort_score=-1)
        assert ids[0] == p2.id

    async def test_llm_score_null_profiles_sorted_last(self):
        """Profile with match but NULL llm score should sort below scored ones."""
        p_scored = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        p_null = await self.gen.profiles.profile(visibility=Visibility.PUBLIC)
        await self.gen.profiles.match(p_scored, user=self.user, score_by_llm=70)
        await self.gen.profiles.match(p_null, user=self.user, score_by_user=50)  # no llm score
        qs = get_profiles_queryset_sorted_by_match(self.user, sort="llm_score")
        ids = [p.id async for p in qs]
        assert ids[0] == p_scored.id  # scored profile first, NULL llm score last
