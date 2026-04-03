from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from django.core.mail import EmailMessage

from neuronhub.apps.sites.models import SiteConfig


async def send_email(
    *,
    subject: str,
    message_html: str,
    email_to: str,
    email_from: str = None,
    email_reply_to: str = None,
    site: SiteConfig = None,
):
    if not site:
        site = await SiteConfig.get_solo()

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
