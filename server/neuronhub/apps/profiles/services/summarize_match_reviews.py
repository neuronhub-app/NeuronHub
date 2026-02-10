from collections.abc import Sequence

from django.db.models import F
from django.db.models import QuerySet

from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.serialize_to_md import serialize_to_md_field
from neuronhub.apps.profiles.services.serialize_to_md import serialize_to_md_xml_field
from neuronhub.apps.users.models import User


Matches = Sequence[ProfileMatch] | QuerySet[ProfileMatch]


def get_reviewed_profiles(user: User) -> QuerySet[ProfileMatch]:
    return (
        ProfileMatch.objects.filter(user=user)
        .exclude(match_score=None)
        .annotate(
            match_score_delta=F("match_score") - F("match_score_by_llm"),
        )
        .select_related("profile")
        .prefetch_related("profile__skills")
        .order_by("match_score_delta")
    )


def format_reviews_as_markdown(reviews: Matches, exclude_extra_fields: bool = False) -> str:
    reviews_str = "\n\n".join([_serialize_review(r, exclude_extra_fields) for r in reviews])

    return f'<Reviews count="{len(reviews)}">\n{reviews_str}\n</Reviews>'


def _serialize_review(match: ProfileMatch, exclude_extra_fields: bool = False) -> str:
    profile = match.profile
    parts = [
        serialize_to_md_field("Review by LLM", match.match_reason_by_llm),
        serialize_to_md_field("Review by User", match.match_review),
        serialize_to_md_field("Job", f"{profile.job_title} @ {profile.company}"),
        serialize_to_md_field("Skills", profile.get_tag_skills_names()),
        serialize_to_md_field("Needs", profile.seeks),
    ]
    if not exclude_extra_fields:
        parts.extend(
            [
                serialize_to_md_field("Offers", profile.offers),
                serialize_to_md_xml_field("bio", profile.biography[:200])
                if profile.biography
                else "",
            ]
        )

    assert match.match_score
    score_delta = match.match_score - (match.match_score_by_llm or 0)
    if score_delta == 0:
        score_delta_str = "0"
    else:
        score_delta_str = f"{score_delta:+d}"

    return serialize_to_md_xml_field(
        "Review",
        text="\n" + "\n\n".join(parts),
        attributes={
            "id": profile.id,
            "score_by_llm": match.match_score_by_llm,
            "score_by_user": match.match_score,
            "score_delta": score_delta_str,
        },
    )


def build_calibration_examples(matches: Matches, max_examples: int = 8) -> str:
    matches_list = list(matches)
    if len(matches_list) >= max_examples:
        # sorted by delta ascending; take ~6 worst downvotes + ~2 mildest corrections from the end
        n_worst = max_examples - 2
        matches_list = matches_list[-2:] + matches_list[:n_worst]

    examples = "\n\n".join([_serialize_calibration_example(m) for m in matches_list])

    return (
        "Here are examples of previous scoring corrections by the user.\n"
        "Use these to calibrate your scoring — understand WHY scores were corrected.\n"
        "\n"
        f"{examples}"
    )


def _serialize_calibration_example(match: ProfileMatch) -> str:
    parts = [
        serialize_to_md_xml_field("match_reason_by_llm", match.match_reason_by_llm),
        serialize_to_md_xml_field("match_review_by_user", match.match_review),
        serialize_to_md_xml_field("bio", match.profile.biography[:100]),
    ]
    return serialize_to_md_xml_field(
        "Example",
        "\n".join(parts),
        attributes={
            "id": match.profile.id,
            "score_by_llm": match.match_score_by_llm,
            "score_by_user": match.match_score,
        },
    )
