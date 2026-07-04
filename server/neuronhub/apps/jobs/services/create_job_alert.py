from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services.utm import UtmParamsInput
from neuronhub.apps.posts.models import PostTag


async def create_job_alert(
    email: str,
    tag_names: list[str] | None = None,
    location_ids: list[int] | None = None,
    is_orgs_highlighted: bool | None = None,
    salary_min: int | None = None,
    is_exclude_no_salary: bool = False,
    is_exclude_career_capital: bool | None = None,
    is_exclude_profit_for_good: bool | None = None,
    tz: str | None = None,
    is_subscribe_to_newsletter: bool = False,
    utm: UtmParamsInput | None = None,
) -> JobAlert:
    utm = utm or UtmParamsInput()
    alert = await JobAlert.objects.acreate(
        email=email,
        is_orgs_highlighted=is_orgs_highlighted,
        salary_min=salary_min,
        is_exclude_no_salary=is_exclude_no_salary,
        is_exclude_career_capital=is_exclude_career_capital,
        is_exclude_profit_for_good=is_exclude_profit_for_good,
        tz=tz,
        is_subscribe_to_newsletter=is_subscribe_to_newsletter,
        utm_source=utm.utm_source or "",
        utm_medium=utm.utm_medium or "",
        utm_campaign=utm.utm_campaign or "",
        utm_content=utm.utm_content or "",
    )
    if tag_names:
        tags = PostTag.objects.filter(name__in=tag_names)
        await alert.tags.aset([tag async for tag in tags])

    if location_ids:
        locations = JobLocation.objects.filter(id__in=location_ids)
        await alert.locations.aset([loc async for loc in locations])

    return alert
