from django.core.management.base import BaseCommand

from neuronhub.apps.profiles.services.csv_import_optimized import get_unprocessed_profiles
from neuronhub.apps.profiles.services.score_matches_by_llm import MatchConfig
from neuronhub.apps.profiles.services.score_matches_by_llm import score_matches_by_llm
from neuronhub.apps.users.models import User


class Command(BaseCommand):
    help = "Run LLM matching on unprocessed profiles"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            type=str,
            required=True,
            help="Username of the user to score matches for",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=50,
        )
        parser.add_argument(
            "--model",
            type=str,
            default="haiku",
            choices=["haiku", "sonnet", "opus"],
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Limit number of attendees to process (for testing)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Skip LLM calls, return deterministic static scores",
        )
        parser.add_argument(
            "--no-calibration",
            action="store_true",
            help="Disable few-shot calibration from human reviews",
        )

    def handle(
        self,
        *args,
        user: str,
        batch_size: int,
        model: str,
        limit: int | None,
        dry_run: bool,
        no_calibration: bool,
        **options,
    ):
        user_obj = User.objects.get(username=user)
        user_profile = user_obj.profile.profile_for_llm_md

        config = MatchConfig(
            user=user_obj,
            user_profile=user_profile,
            batch_size=batch_size,
            model=model,
            dry_run=dry_run,
            use_calibration=not no_calibration,
        )

        attendees = get_unprocessed_profiles(user_obj)
        count_total = attendees.count()

        if limit:
            attendees = attendees[:limit]

        self.stdout.write(
            f"Processing {attendees.count()} of {count_total} unprocessed attendees"
        )
        self.stdout.write(f"Batch size: {batch_size}, Model: {model}")
        self.stdout.write("")

        scores = score_matches_by_llm(attendees, config)

        self.stdout.write(self.style.SUCCESS(f"Scored {len(scores)} attendees"))
        self.stdout.write("")

        for score in sorted(scores, key=lambda x: x.match_score, reverse=True)[:20]:
            self.stdout.write(f"  {score.match_score:3.0f} | {score.match_reasoning_note}")
