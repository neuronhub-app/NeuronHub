from django.db.models import Manager

from neuronhub.apps.jobs.models import Job


async def serialize_job_to_markdown(job: Job) -> str:
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

    if location_names := [loc.name async for loc in job.locations.all()]:
        location_names.sort()
        lines.append(f"- Locations: {', '.join(location_names)}")

    if job.posted_at:
        lines.append(f"- Posted: {job.posted_at:%Y-%m-%d}")
    if job.closes_at:
        lines.append(f"- Closes: {job.closes_at:%Y-%m-%d}")

    if job.salary_min:
        lines.append(f"- Salary min: {job.salary_min:,}")
    if job.salary_text:
        lines.append(f"- Salary text: {job.salary_text}")

    if job.source_ext:
        lines.append(f"- Source: {job.source_ext}")

    await _append_tags(lines, label="Area", manager=job.tags_area)
    await _append_tags(lines, label="Skill", manager=job.tags_skill)
    await _append_tags(lines, label="Education", manager=job.tags_education)
    await _append_tags(lines, label="Experience", manager=job.tags_experience)
    await _append_tags(lines, label="Workload", manager=job.tags_workload)
    await _append_tags(lines, label="Visa sponsor", manager=job.tags_country_visa_sponsor)

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
