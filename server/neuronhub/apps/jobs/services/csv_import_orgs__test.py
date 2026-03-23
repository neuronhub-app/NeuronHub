"""
#AI-slop
"""

from pathlib import Path

import pytest

from neuronhub.apps.jobs.services.csv_import_orgs import csv_import_orgs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_cases import NeuronTestCase


CSV_ORGS_PATH = Path(__file__).resolve().parents[5] / ".local" / "pg-orgs-new.csv"


@pytest.mark.skip(reason="local-only: requires .local/pg-orgs-new.csv")
class TestCsvImportOrgsRealFile(NeuronTestCase):
    async def test_import_50_orgs(self):
        stats = await csv_import_orgs(CSV_ORGS_PATH, limit=50, is_download_logos=False)
        assert stats.created == 50
        assert stats.updated == 0
        assert await Org.objects.acount() >= 50

    async def test_import_idempotent(self):
        await csv_import_orgs(CSV_ORGS_PATH, limit=10, is_download_logos=False)
        stats = await csv_import_orgs(CSV_ORGS_PATH, limit=10, is_download_logos=False)
        assert stats.created == 0
        assert stats.updated == 10
