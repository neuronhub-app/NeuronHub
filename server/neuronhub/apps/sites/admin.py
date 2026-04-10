from adminsortable2.admin import SortableAdminBase
from adminsortable2.admin import SortableAdminMixin
from adminsortable2.admin import SortableStackedInline
from adminsortable2.admin import SortableTabularInline
from asgiref.sync import async_to_sync
from django.contrib import admin
from django.contrib import messages
from django.http import HttpRequest
from django.urls import reverse
from django.utils.safestring import mark_safe
from django_object_actions import DjangoObjectActions
from django_object_actions import action
from simple_history.admin import SimpleHistoryAdmin
from solo.admin import SingletonModelAdmin

from neuronhub.apps.jobs.models import JobFaqQuestion
from neuronhub.apps.jobs.services.send_job_alerts import JobAlertTestContext
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alert_confirmation_email
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alerts
from neuronhub.apps.sites.models import FooterLink
from neuronhub.apps.sites.models import FooterSection
from neuronhub.apps.sites.models import FooterSectionKind
from neuronhub.apps.sites.models import NavbarLink
from neuronhub.apps.sites.models import NavbarLinkSection
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.users.models import User


class JobFaqQuestionInline(SortableStackedInline):
    model = JobFaqQuestion
    extra = 0
    classes = ["collapse"]


class NavbarLinkInline(SortableTabularInline):
    model = NavbarLink
    extra = 0


class NavbarLinkSectionInline(SortableTabularInline):
    model = NavbarLinkSection
    extra = 0
    classes = ["collapse"]
    fields = [
        "label",
        "href",
        "links_edit_form",
        "order",
    ]
    readonly_fields = ["links_edit_form"]

    @admin.display(description="Links")
    def links_edit_form(self, obj: NavbarLinkSection) -> str:
        if not obj.pk:
            return ""
        url = reverse("admin:sites_navbarlinksection_change", args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="button">Edit Links ›</a>')


@admin.register(NavbarLinkSection)
class NavbarLinkSectionAdmin(SortableAdminMixin, SortableAdminBase, admin.ModelAdmin):
    list_display = ["label", "href"]
    inlines = [NavbarLinkInline]


class FooterSectionLinkInline(SortableTabularInline):
    model = FooterLink
    extra = 0

    def get_fields(self, request: HttpRequest, obj: FooterSection | None = None) -> list[str]:
        fields = [
            "label",
            "href",
            "order",
        ]
        if obj and obj.kind is FooterSectionKind.Social:
            fields.append("icon")
        return fields


class FooterSectionInline(SortableTabularInline):
    model = FooterSection
    extra = 0
    classes = ["collapse"]
    fields = [
        "kind",
        "links_edit_form",
        "title",
        "order",
    ]
    readonly_fields = ["links_edit_form"]

    @admin.display(description="Links")
    def links_edit_form(self, obj: FooterSection) -> str:
        if not obj.pk:
            return ""
        url = reverse("admin:sites_footersection_change", args=[obj.pk])
        return mark_safe(f'<a href="{url}" class="button">Edit Section Links ›</a>')


@admin.register(FooterSection)
class FooterSectionAdmin(SortableAdminMixin, SortableAdminBase, admin.ModelAdmin):
    list_display = ["kind", "title"]
    inlines = [FooterSectionLinkInline]


@admin.register(SiteConfig)
class SiteConfigAdmin(
    SimpleHistoryAdmin, SortableAdminBase, DjangoObjectActions, SingletonModelAdmin
):
    inlines = [
        JobFaqQuestionInline,
        NavbarLinkSectionInline,
        FooterSectionInline,
    ]

    fieldsets = [
        (
            None,
            {
                "fields": [
                    "name",
                    "domain",
                    "slug",
                ],
            },
        ),
        (
            "Emails",
            {
                "fields": [
                    "sender_email",
                    "sender_email_name",
                    "contact_email",
                ],
            },
        ),
        (
            "Jobs".upper(),
            {
                "fields": [
                    "jobs_url_utm_source",
                ],
            },
        ),
        (
            "Jobs emails".upper(),
            {
                "fields": [
                    "is_enable_job_alerts",
                    "is_job_alerts_staff_only",
                    "logo_url",
                    "feedback_form_url",
                    "submit_job_url",
                    "address",
                    "email_template_job_alert",
                    "email_template_job_alert_confirmation",
                    "email_html_about_us",
                    "email_html_feedback_request",
                ],
                "classes": ["collapse"],
            },
        ),
    ]

    change_actions = [
        "send_test_job_alert_email",
        "send_test_job_alert_confirmation_email",
    ]

    @action(label="Send test alert email to yourself")
    def send_test_job_alert_email(self, request: HttpRequest, _obj: SiteConfig):
        assert isinstance(request.user, User)

        _send_test_job_alert_email(receiver=request.user)

        _send_success_message(request, user=request.user, email_type="Job Alert")

    @action(label="Send test confirm alert email to yourself")
    def send_test_job_alert_confirmation_email(self, request: HttpRequest, _obj: SiteConfig):
        assert isinstance(request.user, User)

        _send_test_job_alert_email_confirmation(receiver=request.user)

        _send_success_message(request, user=request.user, email_type="Job Alert Confirmation")


def _send_success_message(request: HttpRequest, user: User, email_type: str):
    messages.success(
        request,
        (
            f"Test {email_type} was sent to your email - {user.email}."
            "The email will list 3 Jobs that were deleted as soon as the email was sent - "
            "hence any job/alert URLs won't work."
        ),
    )


@async_to_sync
async def _send_test_job_alert_email_confirmation(receiver: User):
    test_context = await JobAlertTestContext.create(user=receiver)

    await send_job_alert_confirmation_email(alert=test_context.alert)

    await test_context.delete_alert_and_jobs()


@async_to_sync
async def _send_test_job_alert_email(receiver: User):
    test_context = await JobAlertTestContext.create(user=receiver)

    await send_job_alerts(alert_ids=[test_context.alert.id], is_include_test_jobs=True)

    await test_context.delete_alert_and_jobs()
