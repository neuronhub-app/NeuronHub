from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from neuronhub.apps.profiles.services.summarize_match_reviews import format_reviews_as_markdown
from neuronhub.apps.profiles.services.summarize_match_reviews import get_reviewed_profiles
from neuronhub.apps.users.models import User


class Command(BaseCommand):
    help = "Summarize human review corrections on LLM match scores"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user",
            type=str,
            required=True,
            help="Username of the user to get reviews for",
        )
        parser.add_argument(
            "--export",
            type=Path,
            default=settings.BASE_DIR.parent / ".local" / "match-review-summary.md",
        )
        parser.add_argument(
            "--exclude_extra_fields",
            action="store_true",
            help="Almost all except match_* fields; only Skills remains.",
        )

    def handle(
        self,
        *args,
        user: str,
        export: Path | None,
        exclude_extra_fields: bool,
        **options,
    ):
        user_obj = User.objects.get(username=user)
        reviews = get_reviewed_profiles(user_obj)

        if not reviews:
            self.stdout.write("No reviewed matches found.")
            return

        self.stdout.write(f"Reviewed matches: {len(reviews)}\n")
        for review in reviews:
            self.stdout.write(
                f"  {review.match_score_delta:+3d} | {review.match_score_by_llm} -> {review.match_score} | {review.profile_id}"  # type: ignore[attr-defined]
            )
            self.stdout.write(f"       review: {review.match_review}")
            self.stdout.write("")
        if export:
            md = format_reviews_as_markdown(reviews, exclude_extra_fields=exclude_extra_fields)
            export.write_text(md)
            self.stdout.write(self.style.SUCCESS(f"Exported to {export}"))
