"""
#quality-55%
"""

import pytest
from django.conf import settings

from neuronhub.apps.jobs.services.csv_import_orgs import csv_import_orgs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.tests.test_cases import NeuronTestCase


_orgs_csv_path = settings.BASE_DIR.parent / ".local" / "pg-orgs-new.csv"


@pytest.mark.skipif(not _orgs_csv_path.exists(), reason="needs orgs csv")
class TestCsvImportOrgs(NeuronTestCase):
    async def test_import_count_and_idempotence(self):
        limit = 20
        stats = await csv_import_orgs(_orgs_csv_path, limit=limit, is_download_logos=False)
        assert stats.created == limit
        assert stats.updated == 0
        assert await Org.objects.acount() >= limit

        stats = await csv_import_orgs(_orgs_csv_path, limit=limit, is_download_logos=False)
        assert stats.created == 0
        assert stats.updated == limit
