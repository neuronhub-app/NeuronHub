import logging

from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from django.core.mail import EmailMessage

from neuronhub.apps.sites.models import SiteConfig


logger = logging.getLogger(__name__)


async def send_email(
    *,
    subject: str,
    message_html: str,
    email_to: str,
    email_from: str = None,
    email_from_name: str = None,
    email_reply_to: str = None,
    site: SiteConfig = None,
):
    if not site:
        site = await SiteConfig.get_solo()

    email_from = email_from or site.sender_email

    if site.sender_email_name or email_from_name:
        email_from = f"{site.sender_email_name or email_from_name} <{email_from}>"

    email = EmailMessage(
        subject=subject,
        body=message_html,
        from_email=email_from,
        to=[email_to],
        reply_to=[email_reply_to or site.contact_email],
        # todo !! fix: for go-live
        # headers={"List-Unsubscribe": "<mailto:unsub@example.com>"},
    )
    email.content_subtype = "html"

    return await sync_to_async(email.send)()


send_mail_sync = async_to_sync(send_email)
