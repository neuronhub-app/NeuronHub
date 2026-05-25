from http import HTTPStatus
from unittest.mock import AsyncMock
from unittest.mock import patch

from asgiref.sync import sync_to_async
from django.test import Client
from django.test import override_settings
from django.urls import reverse

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.get_jobs_public_from_ram import reset_jobs_loader_for_test
from neuronhub.apps.tests.test_cases import NeuronTestCase


CRON_SECRET = "test-secret-123"


# #AI
@override_settings(DJANGO_CRON_WEBHOOK_SECRET=CRON_SECRET)
class SendEmailsCronTest(NeuronTestCase):
    async def test_valid_secret_enqueues_task(self):
        with patch("neuronhub.apps.jobs.views.send_job_alert_emails_task") as mock_task:
            mock_task.aenqueue = AsyncMock()
            response = await _get_url(secret=CRON_SECRET)

        assert response.status_code == HTTPStatus.OK
        mock_task.aenqueue.assert_called_once()

    async def test_invalid_secret_returns_403(self):
        response = await _get_url(secret="wrong-secret")
        assert response.status_code == HTTPStatus.FORBIDDEN


@sync_to_async
def _get_url(secret: str):
    return Client().get(reverse("jobs_send_emails_cron", args=[secret]))


class JobsCsvTest(NeuronTestCase):
    def setUp(self):
        super().setUp()
        reset_jobs_loader_for_test()

    async def test_csv_returns_header_and_row_per_published_job(self):
        """
        #AI-slop
        """
        loc = await self.gen.jobs.location("London")
        await self.gen.jobs.job(
            is_published=True,
            title="Senior DevOps",
            locations=[loc],
            salary_text="$120k-$150k",
            source_ext=Job.SourceExt.AIM,
        )
        await self.gen.jobs.job(is_published=False, title="Hidden Draft")

        body = (await _get_jobs_csv()).content.decode()

        lines = body.strip().splitlines()
        header = lines[0].split(",")
        # Sample columns asserting the dot-notation flatten convention.
        # Full set is derived from GraphQL `JobsPublic` whitelist response.
        for col in ["id", "title", "org.name", "org.website", "locations", "tags_skill"]:
            assert col in header, col
        assert len(lines) == 2
        assert "Senior DevOps" in lines[1]
        assert "$120k-$150k" in lines[1]
        assert "AIM" in lines[1]
        assert "Hidden Draft" not in body


@sync_to_async
def _get_jobs_csv():
    return Client().get("/api/jobs.csv")
