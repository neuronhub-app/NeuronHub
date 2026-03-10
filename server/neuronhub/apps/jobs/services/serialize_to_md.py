from neuronhub.apps.jobs.models import Job


async def serialize_job_to_markdown(job: Job) -> str:
    lines = [
        f"## {job.title}",
        f"- Org: {job.org.name}",
        f"- URL: {job.url_external}",
        f"- Remote: {job.is_remote}",
        f"- Remote-friendly: {job.is_remote_friendly}",
        f"- Salary: {job.salary_min}",
        f"- Posted: {job.posted_at}",
        f"- Closes: {job.closes_at}",
    ]

    await _append_tags(lines, label="Country", manager=job.tags_country)
    await _append_tags(lines, label="City", manager=job.tags_city)
    await _append_tags(lines, label="Area", manager=job.tags_area)
    await _append_tags(lines, label="Skill", manager=job.tags_skill)
    await _append_tags(lines, label="Education", manager=job.tags_education)
    await _append_tags(lines, label="Experience", manager=job.tags_experience)
    await _append_tags(lines, label="Workload", manager=job.tags_workload)

    return "\n".join(lines) + "\n"


async def _append_tags(lines: list[str], *, label: str, manager) -> None:
    names: list[str] = []
    async for name in manager.values_list("name", flat=True):
        names.append(name)
    if names:
        names.sort()
        lines.append(f"- {label}: {', '.join(names)}")
