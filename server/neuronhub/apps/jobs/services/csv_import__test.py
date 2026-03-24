"""
#AI-slop
"""

from pathlib import Path

import pytest

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services.csv_import import csv_import_jobs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_cases import NeuronTestCase


CSV_JOBS_PATH = Path(__file__).resolve().parents[5] / ".local" / "pg-jobs-new.csv"


@pytest.mark.skip(reason="local-only: requires .local/pg-jobs-new.csv")
class TestCsvImportJobsRealFile(NeuronTestCase):
    async def test_import_50_jobs(self):
        stats = await csv_import_jobs(CSV_JOBS_PATH, limit=50)
        assert stats.created == 50
        assert stats.updated == 0
        assert await Job.objects.acount() == 50
        assert await Org.objects.acount() > 0
        assert await JobLocation.objects.acount() > 0

    async def test_import_idempotent(self):
        await csv_import_jobs(CSV_JOBS_PATH, limit=10)
        stats = await csv_import_jobs(CSV_JOBS_PATH, limit=10)
        assert stats.created == 0
        assert stats.updated == 10
