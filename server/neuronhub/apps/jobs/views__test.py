from http import HTTPStatus
from unittest.mock import AsyncMock
from unittest.mock import patch

from asgiref.sync import sync_to_async
from django.test import Client
from django.test import override_settings
from django.urls import reverse

from neuronhub.apps.tests.test_cases import NeuronTestCase

CRON_SECRET = "test-secret-123"


# #AI
@override_settings(DJANGO_CRON_WEBHOOK_SECRET=CRON_SECRET)
class SendEmailsCronTest(NeuronTestCase):
    async def test_valid_secret_enqueues_task(self):
        with patch("neuronhub.apps.jobs.views.send_job_alert_emails_task") as mock_task:
            mock_task.aenqueue = AsyncMock()
            response = await _get(secret=CRON_SECRET)

        assert response.status_code == HTTPStatus.OK
        mock_task.aenqueue.assert_called_once()

    async def test_invalid_secret_returns_403(self):
        response = await _get(secret="wrong-secret")
        assert response.status_code == HTTPStatus.FORBIDDEN


def _get_sync(secret: str):
    return Client().get(reverse("jobs_send_emails_cron", args=[secret]))


_get = sync_to_async(_get_sync)
