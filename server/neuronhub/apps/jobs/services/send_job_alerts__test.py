from django.conf import settings
from django.core import mail
from django.test import override_settings

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.jobs.services.send_job_alerts import _get_jobs_qs_by_alert
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alert_confirmation_email
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alerts
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestSendJobAlertEmails(NeuronTestCase):
    async def test_staff_only_skips_non_staff_alerts(self):
        site = await SiteConfig.get_solo()
        site.is_job_alerts_staff_only = True
        await site.asave()

        user_staff = await self.gen.users.user(is_superuser=True)
        user_non_staff = await self.gen.users.user(is_superuser=False)

        await self.gen.jobs.job_alert(email=user_non_staff.email)
        await self.gen.jobs.job_alert(email=user_staff.email)
        await self.gen.jobs.job()

        stats = await send_job_alerts()
        assert stats.sent == 1
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [user_staff.email]

    async def test_log_has_user_anon(self):
        alert = await self.gen.jobs.job_alert()
        await self.gen.jobs.job()

        await send_job_alerts()
        log = await JobAlertLog.objects.select_related("user_anon").afirst()
        assert log
        assert log.user_anon
        assert log.user_anon.anon_name

    async def test_skips_jobs_created_before_job_alert(self):
        await self.gen.jobs.job()
        await self.gen.jobs.job_alert()

        stats = await send_job_alerts()
        assert stats.skipped_due_to_no_new_matches_or_new_alert == 1
        assert len(mail.outbox) == 0

    async def test_skips_already_notified(self):
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job_alert()
        await self.gen.jobs.job()

        stats = await send_job_alerts()
        assert stats.sent == 2
        assert len(mail.outbox) == 2
        mail.outbox.clear()

        stats = await send_job_alerts()
        assert stats.skipped_due_to_duplicates == 2
        assert len(mail.outbox) == 0

    async def test_skips_inactive(self):
        await self.gen.jobs.job_alert(is_active=False)
        await self.gen.jobs.job()
        stats = await send_job_alerts()
        assert stats.sent == 0

    async def test_sends_only_at_the_tz_hour(self):
        await self.gen.jobs.job_alert(tz=settings.TIME_ZONE)
        await self.gen.jobs.job()

        hour_current = self.gen.datetime_now().hour
        hour_future = hour_current + 12

        stats = await send_job_alerts(hour_local_to_send_at=hour_future)
        assert stats.skipped_due_to_tz == 1
        assert stats.sent == 0
        assert len(mail.outbox) == 0

        stats = await send_job_alerts(hour_local_to_send_at=hour_current)
        assert stats.skipped_due_to_tz == 0
        assert stats.sent == 1

    async def test_sends_always_if_no_tz_is_defined(self):
        await self.gen.jobs.job_alert(tz=None)
        await self.gen.jobs.job()
        hour_future = self.gen.datetime_now().hour + 12
        stats = await send_job_alerts(hour_local_to_send_at=hour_future)
        assert stats.sent == 1
        assert stats.skipped_due_to_tz == 0

        # no duplicate JobAlerts:
        hour_future_2 = hour_future + 2
        stats = await send_job_alerts(hour_local_to_send_at=hour_future_2)
        assert stats.sent == 0
        assert stats.skipped_due_to_tz == 0
        assert stats.skipped_due_to_duplicates == 1

    async def test_template_override(self):
        site = await SiteConfig.get_solo()

        test_name = "Custom"
        test_addr = "Override Addr"
        site.email_template_job_alert_confirmation = (
            "<html><body>" + test_name + "{{ site_name }} - {{ address }}</body></html>"
        )
        site.address = test_addr
        await site.asave()

        alert = await self.gen.jobs.job_alert()
        await send_job_alert_confirmation_email(alert)

        email_html = mail.outbox[0].body
        assert test_name in email_html
        assert test_addr in email_html

    async def test_email_contains_alert_id_ext_in_job_urls(self):
        site = await SiteConfig.get_solo()
        site.email_template_job_alert = ""
        await site.asave()

        alert = await self.gen.jobs.job_alert()
        job = await self.gen.jobs.job()

        await send_job_alerts()

        email_html = mail.outbox[0].body
        assert f"/{job.slug}?alert={alert.id}" in email_html

    async def test_jobs_notified_count_increment(self):
        alert = await self.gen.jobs.job_alert()
        await self.gen.jobs.job()
        await self.gen.jobs.job()

        await send_job_alerts()

        await alert.arefresh_from_db()
        assert alert.jobs_notified_count == 2

        await self.gen.jobs.job()
        await send_job_alerts()

        await alert.arefresh_from_db()
        assert alert.jobs_notified_count == 3

    # tags_* filters
    # todo ? refac: parametrize to dedup
    # ----------------------------------------------------------------------------

    async def test_matches_by_country_visa_sponsor_tag(self):
        tag_us_visa = await self.gen.posts.tag("US Visa", Category.VisaSponsorship)

        alert = await self.gen.jobs.job_alert(tags=[tag_us_visa])

        await self.gen.jobs.job(tags=[tag_us_visa])
        await self.gen.jobs.job()

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_send_alerts_by_id(self):
        alert_1 = await self.gen.jobs.job_alert()
        alert_2 = await self.gen.jobs.job_alert()
        alert_3 = await self.gen.jobs.job_alert(is_active=False)
        await self.gen.jobs.job()

        stats = await send_job_alerts(alert_ids=[alert_1.id])
        assert stats.sent == 1
        assert len(mail.outbox) == 1

    async def test_filters_by_multiple_locations(self):
        loc_london = await self.gen.jobs.location("London")
        loc_berlin = await self.gen.jobs.location("Berlin", is_remote=True)
        loc_paris = await self.gen.jobs.location("Paris")

        alert = await self.gen.jobs.job_alert(locations=[loc_london, loc_berlin])

        await self.gen.jobs.job(locations=[loc_london])
        await self.gen.jobs.job(locations=[loc_berlin])
        await self.gen.jobs.job(locations=[loc_paris])

        assert 2 == len(await _get_jobs_qs_by_alert(alert))

    async def test_filters_remote_location(self):
        loc_remote = await self.gen.jobs.location(code="US", is_remote=True)
        loc_office = await self.gen.jobs.location("London")

        alert = await self.gen.jobs.job_alert(locations=[loc_remote])

        await self.gen.jobs.job(locations=[loc_remote])
        await self.gen.jobs.job(locations=[loc_office])

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_salary_min_includes_nulls_by_default(self):
        alert = await self.gen.jobs.job_alert(salary_min=100_000)

        await self.gen.jobs.job(salary_min=150_000)
        await self.gen.jobs.job(salary_min=None)
        await self.gen.jobs.job(salary_min=50_000)

        assert 2 == len(await _get_jobs_qs_by_alert(alert))

    async def test_salary_min_with_exclude_no_salary(self):
        alert = await self.gen.jobs.job_alert(
            salary_min=100_000,
            is_exclude_no_salary=True,
        )

        await self.gen.jobs.job(salary_min=150_000)
        await self.gen.jobs.job(salary_min=None)
        await self.gen.jobs.job(salary_min=50_000)

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_exclude_no_salary_without_salary_min(self):
        alert = await self.gen.jobs.job_alert(is_exclude_no_salary=True)

        await self.gen.jobs.job(salary_min=50_000)
        await self.gen.jobs.job(salary_min=None)

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_tag_filter_uses_AND_not_OR(self):
        tag_skill = await self.gen.posts.tag("Python", Category.Skill)
        tag_area = await self.gen.posts.tag("SomeArea", Category.Area)

        alert = await self.gen.jobs.job_alert(tags=[tag_skill, tag_area])

        await self.gen.jobs.job(tags=[tag_skill, tag_area])
        await self.gen.jobs.job(tags=[tag_skill])
        await self.gen.jobs.job(tags=[tag_area])

        jobs = await _get_jobs_qs_by_alert(alert)
        assert 1 == len(jobs)

    # boolean filters
    # ----------------------------------------------------------------------------

    async def test_filters_by_is_orgs_highlighted(self):
        org_h = await Org.objects.acreate(name="Highlighted", is_highlighted=True)
        org_n = await Org.objects.acreate(name="Normal", is_highlighted=False)

        alert = await self.gen.jobs.job_alert(is_orgs_highlighted=True)

        await self.gen.jobs.job(org=org_h)
        await self.gen.jobs.job(org=org_n)

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_filters_by_tag_enum_1(self):
        tag = await self.gen.posts.tag(Job.Tags.CareerCapital, Category.Area)
        alert = await self.gen.jobs.job_alert(is_exclude_career_capital=True)

        await self.gen.jobs.job(tags=[tag])
        await self.gen.jobs.job()

        assert 1 == len(await _get_jobs_qs_by_alert(alert))

    async def test_filters_by_tag_enum_2(self):
        tag = await self.gen.posts.tag(Job.Tags.ProfitForGood, Category.Area)
        alert = await self.gen.jobs.job_alert(is_exclude_profit_for_good=True)

        await self.gen.jobs.job(tags=[tag])
        await self.gen.jobs.job()

        assert 1 == len(await _get_jobs_qs_by_alert(alert))


Category = TagCategoryEnum
