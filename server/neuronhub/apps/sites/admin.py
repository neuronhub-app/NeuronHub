from adminsortable2.admin import SortableAdminBase
from adminsortable2.admin import SortableAdminMixin
from adminsortable2.admin import SortableStackedInline
from adminsortable2.admin import SortableTabularInline
from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.core.mail import send_mail
from django.http import HttpRequest
from django.urls import reverse
from django.utils.safestring import mark_safe
from django_object_actions import DjangoObjectActions
from django_object_actions import action
from solo.admin import SingletonModelAdmin

from neuronhub.apps.jobs.models import JobFaqQuestion
from neuronhub.apps.jobs.services.send_job_alerts import _get_email_context_test
from neuronhub.apps.jobs.services.send_job_alerts import _render_email_html
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
class SiteConfigAdmin(SortableAdminBase, DjangoObjectActions, SingletonModelAdmin):
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
            "Jobs UTM".upper(),
            {
                "fields": [
                    "jobs_url_utm_source",
                ],
            },
        ),
        (
            "Job alert emails".upper(),
            {
                "fields": [
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
    def send_test_job_alert_email(self, request: HttpRequest, obj: SiteConfig):
        assert isinstance(request.user, User)
        _send_test_email(
            receiver=request.user,
            subject="[TEST] Job alert",
            html=_render_email_html(
                template_name="jobs/job_alert.html",
                template_override=obj.email_template_job_alert,
                context=_get_email_context_test(obj, user=request.user),
            ),
        )
        messages.success(request, f"Test email sent to {request.user.email}")

    @action(label="Send test confirm alert email to yourself")
    def send_test_job_alert_confirmation_email(self, request: HttpRequest, obj: SiteConfig):
        assert isinstance(request.user, User)
        _send_test_email(
            receiver=request.user,
            subject="[TEST] Job alert confirmation",
            html=_render_email_html(
                template_name="jobs/job_alert_confirmation.html",
                template_override=obj.email_template_job_alert_confirmation,
                context=_get_email_context_test(obj, user=request.user),
            ),
        )
        messages.success(request, f"Test confirmation email sent to {request.user.email}")


def _send_test_email(receiver: User, subject: str, html: str) -> None:
    send_mail(
        subject=subject,
        message="",
        html_message=html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[receiver.email],
    )
