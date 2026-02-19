import json
import subprocess
import textwrap
from dataclasses import dataclass
from logging import getLogger

from django.conf import settings
from django.db.models import QuerySet
from django.utils import timezone
from faker.proxy import Faker

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.serialize_to_md import serialize_profile_to_markdown
from neuronhub.apps.profiles.services.serialize_to_md import serialize_to_md_xml_field
from neuronhub.apps.profiles.services.summarize_match_reviews import build_calibration_examples
from neuronhub.apps.profiles.services.summarize_match_reviews import get_matches_reviewed
from neuronhub.apps.users.models import User


logger = getLogger(__name__)


@dataclass
class MatchConfig:
    user: User
    user_profile: str
    batch_size: int = 50
    model: str = "haiku"

    is_dry_run: bool = False

    is_use_calibration: bool = True
    calibration_xml_tag = "Reviewed_By_User_For_Calibration"

    is_logs_enabled: bool = True

    def log(self, msg: str):
        if self.is_logs_enabled:
            logger.info(f"LLM scoring: {msg}")


def score_matches_by_llm(
    profiles: QuerySet[Profile] | list[Profile],
    config: MatchConfig,
) -> list[ProfileScore]:
    profile_list = list(profiles)
    profile_batches = [
        profile_list[index : index + config.batch_size]
        for index in range(0, len(profile_list), config.batch_size)
    ]

    scores: list[ProfileScore] = []
    matches_updated: list[ProfileMatch] = []
    for batch_index, batch in enumerate(profile_batches):
        match_result = _score_matches_batch_by_llm(profiles=batch, config=config)

        scores.extend(match_result.scores)

        batch_id = _get_deterministic_profile_batch_id(batch)

        config.log(f"saving batch {batch_index + 1}/{len(profile_batches)}, id={batch_id}")

        now = timezone.now()
        for score in match_result.scores:
            match, _ = ProfileMatch.objects.update_or_create(
                user=config.user,
                profile_id=score.profile_id,
                defaults={
                    "match_batch_id": batch_id,
                    "match_score_by_llm": score.match_score,
                    "match_reason_by_llm": score.match_reasoning_note,
                    "match_processed_at": now,
                },
            )
            matches_updated.append(match)

        if settings.ALGOLIA["IS_ENABLED"]:
            from algoliasearch_django import algolia_engine

            algolia_engine.client.partial_update_objects(
                index_name="profiles",
                objects=[
                    {
                        "objectID": match.profile_id,
                        "match_score_by_llm": match.match_score_by_llm,
                        "match_reason_by_llm": match.match_reason_by_llm,
                        "match_score": match.match_score,
                        "match_processed_at": match.match_processed_at.isoformat()
                        if match.match_processed_at
                        else None,
                        "is_scored_by_llm": True,
                        "needs_reprocessing": False,
                    }
                    for match in matches_updated
                ],
                wait_for_tasks=False,
            )

    return scores


@dataclass
class ProfileScore:
    profile_id: int
    match_score: int
    match_reasoning_note: str


def _get_deterministic_profile_batch_id(batch: list[Profile]) -> str:
    faker = Faker()
    faker.seed_instance(f"{batch[0].last_name}..{batch[-1].last_name}")
    batch_id = "_".join(faker.words(nb=4))  # deterministic "hash" out of "words"
    return batch_id


@dataclass
class BatchResult:
    scores: list[ProfileScore]
    prompt: str = ""
    system_prompt: str = ""


def _score_matches_batch_by_llm(
    profiles: list[Profile],
    config: MatchConfig,
) -> BatchResult:
    reviewed_calibration_md = ""

    if config.is_use_calibration and (matches_reviewed := get_matches_reviewed(config.user)):
        reviewed_calibration_md = serialize_to_md_xml_field(
            tag_name=config.calibration_xml_tag,
            text=build_calibration_examples(matches=matches_reviewed, max_examples=8),
        )

    profiles_xml = "\n\n".join([serialize_profile_to_markdown(a) for a in profiles])
    prompt = (
        'Score these professional profiles. Return scores by their "id".\n'
        "\n\n"
        f"{serialize_to_md_xml_field('My_Profile', config.user_profile)}"
        "\n\n\n"
        f"{reviewed_calibration_md}"
        "\n\n\n"
        f"<Profile_List>\n{profiles_xml}\n</Profile_List>\n"
    )

    system_prompt = _build_system_prompt()
    if config.is_dry_run:
        scores = [
            ProfileScore(profile_id=profile.id, match_score=50, match_reasoning_note="dry run")
            for profile in profiles
        ]
        return BatchResult(scores=scores, system_prompt=system_prompt, prompt=prompt)

    config.log(f"batch of {len(profiles)}...")

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

    config.log(f"scored {len(scores)}")

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
