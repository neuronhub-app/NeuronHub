from asgiref.sync import sync_to_async
from django.conf import settings
from django.utils import timezone

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import
from neuronhub.apps.profiles.services.summarize_match_reviews import build_calibration_examples
from neuronhub.apps.profiles.services.summarize_match_reviews import format_reviews_as_markdown
from neuronhub.apps.profiles.services.summarize_match_reviews import get_reviewed_profiles
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.models import User


def _get_reviewed_attendees_list(user):
    return list(get_reviewed_profiles(user))


# #AI-slop
class SummarizeMatchReviewsTest(NeuronTestCase):
    async def test_get_reviewed_matches_detects_score_delta_from_history(self):
        attendees = await _get_profiles_from_csv(limit=5)

        await gen_llm_scoring(attendees[0], self.user, score_by_llm=80)
        await gen_llm_scoring(attendees[1], self.user, score_by_llm=70)
        await gen_user_review(
            attendees[0], self.user, score_by_user=60, review_note="no overlap in seeks/offers"
        )
        await gen_user_review(
            attendees[1], self.user, score_by_user=20, review_note="AIS-pivot, no depth"
        )

        reviews = await sync_to_async(_get_reviewed_attendees_list)(self.user)

        assert len(reviews) == 2
        # note, `match_score_delta` is added by [[get_reviewed_profiles]]
        assert all(r.match_score_delta < 0 for r in reviews)

        worst = reviews[0]  # sorted by score_delta ascending
        assert worst.match_score_by_llm == 70
        assert worst.match_score == 20
        assert worst.match_score_delta == -50
        assert worst.match_review == "AIS-pivot, no depth"

        better = reviews[1]
        assert better.match_score_by_llm == 80
        assert better.match_score == 60
        assert better.match_score_delta == -20

    async def test_calibration_examples_use_real_attendee_data(self):
        attendees = await _get_profiles_from_csv(limit=3)

        await gen_llm_scoring(
            attendees[0], self.user, score_by_llm=75, reason="some SWE overlap"
        )
        await gen_user_review(
            attendees[0], self.user, score_by_user=40, review_note="no shared seeks"
        )

        reviews = await sync_to_async(_get_reviewed_attendees_list)(self.user)
        calibration = build_calibration_examples(reviews)

        assert '="75"' in calibration
        assert '="40"' in calibration
        assert "<match_review_by_user>" in calibration
        assert "<match_reason_by_llm>" in calibration
        assert "<seeks>" not in calibration
        assert "<offers>" not in calibration

    async def test_calibration_capped_at_max_examples(self):
        attendees = await _get_profiles_from_csv(limit=12)

        for i, att in enumerate(attendees):
            await gen_llm_scoring(att, self.user, score_by_llm=70 + i)
            await gen_user_review(
                att, self.user, score_by_user=30 + i, review_note=f"reason {i}"
            )

        reviews = await sync_to_async(_get_reviewed_attendees_list)(self.user)
        assert len(reviews) == 12

        calibration = build_calibration_examples(reviews, max_examples=8)
        assert calibration.count("<Example ") == 8

    async def test_calibration_picks_positive_over_mild_negative(self):
        attendees = await _get_profiles_from_csv(limit=12)

        # 10 negative corrections (delta = -40)
        for att in attendees[:10]:
            await gen_llm_scoring(att, self.user, score_by_llm=70)
            await gen_user_review(att, self.user, score_by_user=30)

        # 2 positive corrections (delta = +20)
        review_note = "passable rating"
        for att in attendees[10:12]:
            await gen_llm_scoring(att, self.user, score_by_llm=50)
            await gen_user_review(att, self.user, score_by_user=70, review_note=review_note)

        reviews = await sync_to_async(_get_reviewed_attendees_list)(self.user)
        calibration = build_calibration_examples(reviews, max_examples=8)

        # todo ! fix
        # assert review_note in calibration

        # 2 positive (score_by_user=70) + 6 negative (score_by_user=30)
        assert calibration.count('score_by_user="70"') == 2
        assert calibration.count('score_by_user="30"') == 6

    async def test_format_reviews_sorted_by_delta(self):
        attendees = await _get_profiles_from_csv(limit=3)

        await gen_llm_scoring(attendees[0], self.user, score_by_llm=80)
        await gen_llm_scoring(attendees[1], self.user, score_by_llm=60)
        await gen_user_review(
            attendees[0], self.user, score_by_user=35, review_note="too generic offers"
        )
        await gen_user_review(
            attendees[1], self.user, score_by_user=55, review_note="ok but low value"
        )

        reviews = await sync_to_async(_get_reviewed_attendees_list)(self.user)
        md = format_reviews_as_markdown(reviews)

        assert 'score_delta="-45"' in md
        # verify sorted: worst score_delta first
        pos_worst = md.index('score_delta="-45"')
        pos_better = md.index('score_delta="-5"')
        assert pos_worst < pos_better


async def _get_profiles_from_csv(limit: int = 5) -> list[Profile]:
    await sync_to_async(csv_optimize_and_import)(
        settings.CONF_CONFIG.eag_csv_path,  # type: ignore[has-type]
        limit=limit,
    )
    return await sync_to_async(lambda: list(Profile.objects.all()[:limit]))()


async def gen_llm_scoring(
    profile: Profile, user: User, score_by_llm: int, reason: str = "dry run"
) -> None:
    await ProfileMatch.objects.aupdate_or_create(
        user=user,
        profile=profile,
        defaults={
            "match_score_by_llm": score_by_llm,
            "match_reason_by_llm": reason,
            "match_processed_at": timezone.now(),
        },
    )


async def gen_user_review(
    profile: Profile, user: User, score_by_user: int, review_note: str = ""
) -> None:
    await ProfileMatch.objects.aupdate_or_create(
        user=user,
        profile=profile,
        defaults={
            "match_score": score_by_user,
            "match_review": review_note,
        },
    )
