import csv
from dataclasses import dataclass
from pathlib import Path

from django.db.models import Count

from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.models import ProfileMatch
from neuronhub.apps.profiles.services.csv_optimize_tokens import csv_optimize_tokens
from neuronhub.apps.users.models import User


@dataclass
class SyncStats:
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    deleted: int = 0

    @property
    def needs_processing_count(self) -> int:
        return self.created + self.updated


def csv_optimize_and_import(csv_path: Path, limit: int | None = None) -> SyncStats:
    rows = _parse_profiles_csv(csv_path)

    stats = SyncStats()

    tag_parent, _ = PostTag.objects.get_or_create(name="Skill", tag_parent=None)

    for profile_row_raw in rows[:limit] if limit else rows:
        profile_row = {key: csv_optimize_tokens(val) for key, val in profile_row_raw.items()}
        if not profile_row:
            continue

        career_stage = _split_list_of_strings(profile_row.pop("career_stage"))
        tag_skills = _split_list_of_strings(profile_row.pop("skills"))
        tag_interests = _split_list_of_strings(profile_row.pop("interests"))

        defaults = {
            **profile_row,
            "career_stage": career_stage,
        }

        if defaults["url_conference"]:
            profile, is_created = Profile.objects.update_or_create(
                url_conference=defaults["url_conference"],
                defaults=defaults,
            )
        else:
            profile, is_created = Profile.objects.update_or_create(
                first_name=defaults["first_name"],
                last_name=defaults["last_name"],
                defaults=defaults,
            )

        profile.skills.set(_resolve_tags(parent=tag_parent, names=tag_skills))
        profile.interests.set(_resolve_tags(parent=tag_parent, names=tag_interests))

        is_updated = profile.match_hash != profile.compute_content_hash()
        if is_created:
            stats.created += 1
            profile.match_hash = profile.compute_content_hash()
            profile.save()
        elif is_updated:
            for field, value in defaults.items():
                if field != "match_hash":
                    setattr(profile, field, value)
            profile.match_hash = profile.compute_content_hash()
            profile.save()

            match = (
                ProfileMatch.objects.filter(profile=profile)
                .order_by("-match_processed_at")
                .first()
            )
            if match:
                match.match_score_by_llm = None
                match.match_reason_by_llm = ""
                match.match_processed_at = None
                match.save()

            stats.updated += 1
        else:
            stats.unchanged += 1

    _report_duplicates_if_any()

    return stats


def _resolve_tags(names: list[str], parent: PostTag) -> list[PostTag]:
    tags = []
    for name in names:
        tag, _ = PostTag.objects.get_or_create(name=name, tag_parent=parent)
        tags.append(tag)
    return tags


def get_unprocessed_profiles(user: User):
    return Profile.objects.exclude(matches__user=user, matches__match_processed_at__isnull=False)


def _split_list_of_strings(value: str) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(";") if part.strip()]


def _parse_profiles_csv(csv_path: Path) -> list[dict[str, str]]:
    with open(csv_path, newline="", encoding="utf-8") as file:
        rows = list(csv.reader(file))

    rows_index_non_decorative = 4
    header = rows[rows_index_non_decorative]
    col_map = {
        "First Name": "first_name",
        "Last Name": "last_name",
        "Company": "company",
        "Job Title": "job_title",
        "Career Stage": "career_stage",
        "Biography": "biography",
        "Areas of Expertise": "skills",
        "Areas of Interest": "interests",
        "How Others Can Help Me": "seeks",
        "How I Can Help Others": "offers",
        "Country": "country",
        "Seeking work?": "seeking_work",
        "Recruitment": "recruitment",
        "LinkedIn": "url_linkedin",
        "Swapcard": "url_conference",
    }

    result = []
    for row in rows[rows_index_non_decorative + 1 :]:
        record = {}
        for col_index, col_name in enumerate(header):
            if col_name in col_map:
                record[col_map[col_name]] = row[col_index] if col_index < len(row) else ""
        result.append(record)

    return result


def _report_duplicates_if_any():
    duplicate_urls = (
        Profile.objects.values("url_conference")
        .annotate(count=Count("id"))
        .filter(count__gt=1)
        .values_list("url_conference", flat=True)
    )
    profile_dups = (
        Profile.objects.filter(url_conference__in=duplicate_urls)
        .values("first_name", "created_at", "url_conference")
        .order_by("url_conference", "created_at")
    )
    for profile in profile_dups:
        print(profile)

    duplicate_urls = (
        Profile.objects.values("first_name", "last_name", "id")
        .annotate(count=Count("id"))
        .filter(count__gt=1)
        .values_list("id", flat=True)
    )
    profile_dups = (
        Profile.objects.filter(
            id__in=duplicate_urls,
        )
        .values("first_name", "created_at", "url_conference")
        .order_by("first_name", "created_at")
    )

    for profile in profile_dups:
        print(profile)
