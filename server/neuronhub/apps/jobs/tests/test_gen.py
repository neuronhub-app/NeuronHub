from dataclasses import dataclass
from typing import Literal

from django.utils import timezone
from django_countries.fields import Country
from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.models import JobsLandingPage
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.orgs.tests.test_gen import OrgsGen
from neuronhub.apps.posts.models import PostTag


@dataclass
class JobsGen:
    faker: UniqueProxy
    orgs: OrgsGen
    visibility_default: Visibility = Visibility.PUBLIC

    async def job(
        self,
        org: Org = None,
        title: str | None = None,
        slug: str = None,
        description: str = "",
        url_external: str = "",
        source_ext: Job.SourceExt = None,
        salary_min: int = None,
        salary_text: str = "",
        created_at_in_airtable=None,
        closes_at=None,
        published_at=None,
        visibility: Visibility = Visibility.PUBLIC,
        is_published: bool = True,
        is_created_by_sync: bool = False,
        is_pending_removal: bool = False,
        is_save: bool = True,
        tags: list[PostTag] = None,
        locations: list[JobLocation] = None,
    ) -> Job:
        if not org:
            org = await self.orgs.create()

        job = Job(
            is_test_job=True,
            title=title or self.faker.sentence(),
            org=org,
            description=description,
            url_external=url_external or self.faker.url(),
            source_ext=source_ext,
            salary_min=salary_min,
            salary_text=salary_text,
            created_at_in_airtable=created_at_in_airtable or timezone.now(),
            closes_at=closes_at,
            published_at=published_at or (timezone.now() if is_published else None),
            visibility=visibility,
            is_published=is_published,
            is_created_by_sync=is_created_by_sync,
            is_pending_removal=is_pending_removal,
        )
        if is_save:
            await job.asave()

            if slug:
                job.slug = slug  # must be manual
                await job.asave()
        if tags:
            for tag in tags:
                category = await tag.categories.afirst()
                assert category, f"Add category to '{tag.name}' tag."
                field_name = Job.tag_category_to_field[category.name]
                await getattr(job, field_name).aadd(tag)
        if locations:
            await job.locations.aset(locations)
        return job

    async def job_draft(
        self,
        job: Job = None,
        title: str = "",
        is_pending_removal: bool = False,
        is_created_by_sync: bool = True,
    ) -> Job:
        job_draft = await self.job(
            org=job.org if job else await self.orgs.create(),
            slug=job.slug if job else "",
            title=title,
            url_external=job.url_external if job else self.faker.url(),
            is_published=False,
            is_created_by_sync=is_created_by_sync,
            is_pending_removal=is_pending_removal,
        )
        if job:
            await job.versions.aadd(job_draft)
        return job_draft

    async def location(
        self,
        city: Literal["London", "Berlin", "Paris"] | str | None = None,
        code: str | None = None,
        is_remote: bool = False,
        is_global: bool = False,
        is_add_country: bool = True,
    ) -> JobLocation:
        country = ""
        if code:
            country = Country(code=code).name

        if is_add_country:
            match city:
                case "London":
                    country = Country(code="GB").name
                case "Berlin":
                    country = Country(code="DE").name
                case "Paris":
                    country = Country(code="FR").name

        name_composed = ""
        if city and country:
            name_composed = f"{city}, {country}"
        elif is_global:
            name_composed = "Remote, Global"
        elif country and is_remote:
            name_composed = f"Remote, {country or f'{city}, {country}'}"
        elif city:
            name_composed = city

        if is_random_needed := not name_composed:
            country = Country(code=self.faker.country_code()).name
            name_composed = country

        if is_remote:
            loc_type = JobLocation.LocationType.REMOTE
        elif city:
            loc_type = JobLocation.LocationType.CITY
        else:
            loc_type = JobLocation.LocationType.COUNTRY

        loc, _ = await JobLocation.objects.aget_or_create(
            name=name_composed,
            defaults={
                "type": loc_type,
                "city": city or "",
                "country": country,
                "is_remote": is_remote,
            },
        )
        return loc

    async def job_alert(
        self,
        email: str = "",
        is_active: bool = True,
        tz: str | None = None,
        tags: list[PostTag] | None = None,
        locations: list[JobLocation] | None = None,
        is_orgs_highlighted: bool | None = None,
        salary_min: int | None = None,
        is_exclude_no_salary: bool = False,
        is_exclude_career_capital: bool | None = None,
        is_exclude_profit_for_good: bool | None = None,
    ) -> JobAlert:
        alert = await JobAlert.objects.acreate(
            email=email or self.faker.email(),
            is_active=is_active,
            tz=tz,
            is_orgs_highlighted=is_orgs_highlighted,
            salary_min=salary_min,
            is_exclude_no_salary=is_exclude_no_salary,
            is_exclude_career_capital=is_exclude_career_capital,
            is_exclude_profit_for_good=is_exclude_profit_for_good,
        )
        if tags:
            await alert.tags.aset(tags)
        if locations:
            await alert.locations.aset(locations)
        return alert

    async def jobs_landing_page(
        self,
        slug: str,
        title: str,
        subtitle: str = "",
        meta_title: str = "",
        meta_description: str = "",
        meta_image_url: str = "",
        tags: list[PostTag] | None = None,
        locations: list[JobLocation] | None = None,
        salary_min: int | None = None,
        is_orgs_highlighted: bool | None = None,
        source_ext: Job.SourceExt | None = None,
        is_published: bool = True,
    ) -> JobsLandingPage:
        """
        #AI
        """
        page = await JobsLandingPage.objects.acreate(
            slug=slug,
            title=title,
            subtitle=subtitle,
            meta_title=meta_title,
            meta_description=meta_description,
            meta_image_url=meta_image_url,
            salary_min=salary_min,
            is_orgs_highlighted=is_orgs_highlighted,
            source_ext=source_ext,
            is_published=is_published,
        )
        if tags:
            await page.tags.aset(tags)
        if locations:
            await page.locations.aset(locations)
        return page
