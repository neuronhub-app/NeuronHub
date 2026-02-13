import json
import subprocess
import textwrap
from dataclasses import dataclass
from logging import getLogger

from django.db.models import QuerySet
from django.utils import timezone

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.serialize_to_md import serialize_profile_to_markdown
from neuronhub.apps.profiles.services.serialize_to_md import serialize_to_md_xml_field
from neuronhub.apps.profiles.services.summarize_match_reviews import build_calibration_examples
from neuronhub.apps.profiles.services.summarize_match_reviews import get_reviewed_profiles
from neuronhub.apps.users.models import User


logger = getLogger(__name__)


@dataclass
class MatchConfig:
    user: User
    user_profile: str
    batch_size: int = 50
    model: str = "haiku"
    dry_run: bool = False
    use_calibration: bool = True


def score_matches_by_llm(
    profiles: QuerySet[Profile] | list[Profile],
    config: MatchConfig,
) -> list[ProfileScore]:
    profile_list = list(profiles)
    batches = [
        profile_list[index : index + config.batch_size]
        for index in range(0, len(profile_list), config.batch_size)
    ]

    scores: list[ProfileScore] = []
    for batch_index, batch in enumerate(batches):
        batch_id_str = f"{batch[0].first_name}..{batch[-1].first_name}".lower()

        result = _score_matches_batch_by_llm(profiles=batch, config=config)
        scores.extend(result.scores)

        logger.info(f"Saving batch {batch_index + 1}/{len(batches)}, id={batch_id_str}")
        now = timezone.now()
        for score in result.scores:
            ProfileMatch.objects.update_or_create(
                user=config.user,
                profile=Profile.objects.get(id=score.profile_id),
                defaults={
                    "match_batch_id": batch_id_str,
                    "match_score_by_llm": score.match_score,
                    "match_reason_by_llm": score.match_reasoning_note,
                    "match_processed_at": now,
                },
            )

    return scores


@dataclass
class ProfileScore:
    profile_id: int
    match_score: int
    match_reasoning_note: str


@dataclass
class BatchResult:
    scores: list[ProfileScore]
    prompt: str = ""
    system_prompt: str = ""


def _score_matches_batch_by_llm(
    profiles: list[Profile],
    config: MatchConfig,
) -> BatchResult:
    calibration_block = ""
    if config.use_calibration:
        reviews = get_reviewed_profiles(config.user)
        if reviews:
            calibration_block = serialize_to_md_xml_field(
                "Calibration_Examples", build_calibration_examples(reviews)
            )

    profiles_xml = "\n\n".join([serialize_profile_to_markdown(a) for a in profiles])
    prompt = (
        'Score these professional profiles. Return scores by their "id".\n'
        "\n\n"
        f"{serialize_to_md_xml_field('My_Profile', config.user_profile)}"
        "\n\n\n"
        f"{calibration_block}"
        "\n\n\n"
        f"<Profile_List>\n{profiles_xml}\n</Profile_List>\n"
    )

    system_prompt = _build_system_prompt()
    if config.dry_run:
        scores = [
            ProfileScore(profile_id=profile.id, match_score=50, match_reasoning_note="dry run")
            for profile in profiles
        ]
        return BatchResult(scores=scores, prompt=prompt, system_prompt=system_prompt)

    logger.info(f"LLM: batch of {len(profiles)}...")
    llm_output_json = _call_llm_api(
        prompt,
        schema=_get_json_schema(valid_ids=[profile.id for profile in profiles]),
        model=config.model,
        system_prompt=system_prompt,
    )

    scores = [
        ProfileScore(
            profile_id=score[json_key.id],
            match_score=score[json_key.match_score],
            match_reasoning_note=score[json_key.match_reasoning_note],
        )
        for score in llm_output_json[json_key.match_scores]
    ]

    logger.info(f"Claude: scored {len(scores)}")
    return BatchResult(scores=scores, system_prompt=system_prompt, prompt=prompt)


def _call_llm_api(prompt: str, schema: str, model: str, system_prompt: str) -> dict:
    result = subprocess.run(
        [
            "claude",
            f"--model={model}",
            f"--system-prompt={system_prompt}",
            "--tools=",
            f"--json-schema={schema}",
            "--output-format=json",
            "--print",
            prompt,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    response = json.loads(result.stdout)
    return response["structured_output"]


def _build_system_prompt() -> str:
    return textwrap.dedent(
        f"""\
        You are an inhuman intelligence scoring professional Profiles for how valuable for me would be to meet them.
        
        Don't use friendly or encouraging language.

        Note: Humans tend to subconsciously act based on their incentives, often short-term oriented.

        For each Profile, score 0-100 based on:
        - Alignment with my interests and goals.
        - Mutual value exchange potential.
        - Seeks/offers and interests/skills that match mine.

        Score ranges:
        - 90-100: Must-meet. Strong mutual value, directly relevant - seeks/offers exactly what I seek/offer.
        - 80-89: Good alignment, likely a productive conversation. Significantly matching my seeks/offers.
        - 70-79: Fair alignment, might be a productive conversation. Some seeks/offers overlap.
        - 60-69: Maybe. Some relevance but limited mutual exchange or too narrow.
        - 30-59: Low priority. Tangential overlap.
        - 0-29: Skip. No relevant overlap or wrong field entirely.

        The median Profile should land around 40-50, not 65-70.
        I'd rather miss a few good matches than waste time on bad ones.

        Ignore English grammar in favor of information density - be succint but informative in "{json_key.match_reasoning_note}".
        """
    )


class json_key:
    id = "id"
    match_scores = "match_scores"
    match_score = "match_score"
    match_reasoning_note = "match_reasoning_note"


def _get_json_schema(valid_ids: list[int]):
    return json.dumps(
        {
            "type": "object",
            "properties": {
                json_key.match_scores: {
                    "type": "array",
                    "minItems": len(valid_ids),
                    "maxItems": len(valid_ids),
                    "uniqueItems": True,
                    "items": {
                        "type": "object",
                        "properties": {
                            json_key.id: {
                                "type": "integer",
                                "enum": valid_ids,
                            },
                            json_key.match_reasoning_note: {"type": "string", "maxLength": 256},
                            json_key.match_score: {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 100,
                            },
                        },
                        "required": [
                            json_key.id,
                            json_key.match_score,
                            json_key.match_reasoning_note,
                        ],
                    },
                },
            },
            "required": [json_key.match_scores],
        }
    )
