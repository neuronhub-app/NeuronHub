import logging

import httpxyz
import sentry_sdk
from django.conf import settings
from httpxyz import Response

from neuronhub.apps.users.models import UserAnon


logger = logging.getLogger(__name__)


async def subscribe_to_mailerlite(email: str, utm_fields_raw: dict[str, str]) -> bool:
    if not settings.PG_MAILERLITE_API:
        logger.error("PG_MAILERLITE_API not set, skipped subscribe_to_mailerlite")
        return False

    utm_fields = {key: value for key, value in utm_fields_raw.items() if value}  # drops empty

    try:
        assert settings.VITE_SITE == "pg", "this is PG-only function"

        async with httpxyz.AsyncClient(timeout=30.0) as client:
            response = await _subscribe_http_post(client, email=email, fields_utm=utm_fields)

            if response.is_error and utm_fields:
                response_wo_utm = await _subscribe_http_post(client, email=email, fields_utm={})
                if not response_wo_utm.is_error:
                    sentry_sdk.set_context(
                        "mailerlite_request",
                        {
                            "anon_name": UserAnon.get_or_create_from_email(email),
                            "utm_fields": utm_fields,
                        },
                    )
                    sentry_sdk.capture_message(
                        "MailerLite rejected the UTM fields - create them in its dashboard. The subscriber was created without UTM fields.",
                        level="error",
                    )
                response_wo_utm.raise_for_status()

            response.raise_for_status()
    except Exception:
        sentry_sdk.capture_exception()
        sentry_sdk.metrics.count(f"{sentry_job_alert_metric}.failed", 1)
        return False

    sentry_sdk.metrics.count(f"{sentry_job_alert_metric}.created", 1)
    return True


sentry_job_alert_metric = "mailerlite_sub_new"


async def _subscribe_http_post(
    client: httpxyz.AsyncClient, email: str, fields_utm: dict[str, str]
) -> Response:
    return await client.post(
        url="https://connect.mailerlite.com/api/subscribers",
        headers={"Authorization": f"Bearer {settings.PG_MAILERLITE_API}"},
        json={
            "email": email,
            "status": "active",
            "fields": {"website_page_url": settings.CLIENT_URL, **fields_utm},
            # This is ID for PG's `Intro Series` - the automation moves them to `Subscribers` after the intro.
            "groups": ["160318692392961959"],
        },
    )
