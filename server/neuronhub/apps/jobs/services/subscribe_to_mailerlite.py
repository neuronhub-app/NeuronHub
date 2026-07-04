import dataclasses
import logging

import httpxyz
import sentry_sdk
from django.conf import settings

from neuronhub.apps.jobs.services.utm import UtmParamsInput


logger = logging.getLogger(__name__)


async def subscribe_to_mailerlite(email: str, utm: UtmParamsInput | None = None) -> bool:
    if not settings.PG_MAILERLITE_API:
        logger.error("PG_MAILERLITE_API not set, skipped subscribe_to_mailerlite")
        return False

    try:
        utm_fields = {
            key: val for key, val in dataclasses.asdict(utm or UtmParamsInput()).items() if val
        }
        is_subscribed = await _create_subscriber(email, extra_fields=utm_fields)

        # MailerLite rejects the whole request if a custom field isn't pre-created in their dashboard.
        if not is_subscribed and utm_fields:
            return await _create_subscriber(email, extra_fields={})

        return is_subscribed
    except Exception:
        sentry_sdk.capture_exception()
        return False


async def _create_subscriber(email: str, extra_fields: dict) -> bool:
    try:
        assert settings.VITE_SITE == "pg", "this is PG-only function"

        async with httpxyz.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url="https://connect.mailerlite.com/api/subscribers",
                headers={"Authorization": f"Bearer {settings.PG_MAILERLITE_API}"},
                json={
                    "email": email,
                    "status": "active",
                    "fields": {"website_page_url": settings.CLIENT_URL, **extra_fields},
                    # [`Intro Series`] - the automation moves to `Subscribers` after the intro.
                    "groups": ["160318692392961959"],
                },
            )
            response.raise_for_status()
    except Exception:
        sentry_sdk.capture_exception()
        sentry_sdk.metrics.count(f"{sentry_metric}.failed", 1)
        return False

    sentry_sdk.metrics.count(f"{sentry_metric}.created", 1)
    return True


sentry_metric = "mailerlite_sub_new"
