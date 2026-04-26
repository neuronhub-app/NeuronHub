from django.db.models import Manager

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation


async def serialize_job_to_md(job: Job) -> str:
    lines = [
        f"## {job.title} | {job.org.name}",
        f"- URL: {job.url_external}",
        f"- Domain: {job.org.domain}",
        f"- Website: {job.org.website}",
        f"- Logo: {job.org.logo.name if job.org.logo else ''}",
    ]

    if job.org.is_highlighted:
        lines.append("- Org is highlighted")

    if job.org.jobs_page_url:
        lines.append(f"- Org jobs: {job.org.jobs_page_url}")

    locations = [loc async for loc in job.locations.all()]

    # Drop COUNTRY when a CITY is present (dedup str). REMOTE are kept. #AI
    loc_city_countries = {loc.country for loc in locations if loc.city}
    location_names_wo_dups = sorted(
        loc.name
        for loc in locations
        if not (
            loc.type is JobLocation.LocationType.COUNTRY and loc.country in loc_city_countries
        )
    )
    if location_names_wo_dups:
        lines.append(f"- Locations: {', '.join(location_names_wo_dups)}")

    if job.posted_at:
        lines.append(f"- Posted: {job.posted_at:%Y-%m-%d}")
    if job.closes_at:
        lines.append(f"- Closes: {job.closes_at:%Y-%m-%d}")

    if job.salary_min:
        lines.append(f"- Salary min: ${job.salary_min:,}")
    if job.salary_text:
        lines.append(f"- Salary text: {job.salary_text}")

    if job.source_ext:
        lines.append(f"- Source: {job.source_ext}")

    if job.is_duplicate_url_valid:
        lines.append("- Duplicate URL: valid")

    await _append_tags(lines, label="Area", manager=job.tags_area)
    await _append_tags(lines, label="Skill", manager=job.tags_skill)
    await _append_tags(lines, label="Education", manager=job.tags_education)
    await _append_tags(lines, label="Experience", manager=job.tags_experience)
    await _append_tags(lines, label="Workload", manager=job.tags_workload)

    if job.description:
        lines.append("")
        lines.append("### Description")
        lines.append(job.description)

    if job.org.description:
        lines.append("")
        lines.append("### Org")
        lines.append(job.org.description)

    return "\n".join(lines) + "\n"


async def _append_tags(lines: list[str], *, label: str, manager: Manager) -> None:
    # `.all()` for prefetch cache
    names = sorted([tag.name async for tag in manager.all()])
    if names:
        lines.append(f"- {label}: {', '.join(names)}")
