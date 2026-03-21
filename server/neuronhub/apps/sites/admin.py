from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.core.mail import send_mail
from django.http import HttpRequest
from django_object_actions import DjangoObjectActions
from django_object_actions import action
from solo.admin import SingletonModelAdmin

from neuronhub.apps.jobs.services.send_job_alerts import _get_email_context_test
from neuronhub.apps.jobs.services.send_job_alerts import _render_email_html
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.users.models import User


@admin.register(SiteConfig)
class SiteConfigAdmin(DjangoObjectActions, SingletonModelAdmin):
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
