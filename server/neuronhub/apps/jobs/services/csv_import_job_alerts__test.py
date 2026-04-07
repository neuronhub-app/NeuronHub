from pathlib import Path

import pytest

from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.tests.test_cases import NeuronTestCase

from .csv_import_job_alerts import _map_country_name
from .csv_import_job_alerts import _map_tag_name
from .csv_import_job_alerts import csv_import_job_alerts

CSV_PATH = Path(__file__).resolve().parents[5] / ".local/issues/attachments/jobalerts.csv"


class TestMapCountryName:
    # parenthetical → jobs CSV canonical short form
    @pytest.mark.parametrize(
        "raw, expected",
        [
            ("United States (USA)", "USA"),
            ("United Kingdom (UK)", "UK"),
        ],
    )
    def test_parenthetical_to_canonical(self, raw, expected):
        assert _map_country_name(raw) == expected

    # Côte d'Ivoire: alert has U+2019 curly quote, jobs CSV has ASCII apostrophe
    def test_cote_divoire_unicode(self):
        assert _map_country_name("C\u00f4te d\u2019Ivoire") == "C\u00f4te d'Ivoire"

    # pass-through countries that exist as-is in jobs CSV
    @pytest.mark.parametrize("name", ["Canada", "Kenya", "Czechia", "Laos", "Germany"])
    def test_passthrough(self, name):
        assert _map_country_name(name) == name

    # invalid → None
    @pytest.mark.parametrize(
        "name",
        ["EU", "Europe", "Africa", "Remote", "Global", "Multiple Locations: Europe"],
    )
    def test_invalid(self, name):
        assert _map_country_name(name) is None

    def test_arabic(self):
        assert _map_country_name("\u0628\u0644\u062c\u064a\u0643\u0627") is None


class TestMapTagName:
    # cause areas
    @pytest.mark.parametrize(
        "old, new",
        [
            ("Biosecurity & Pandemic Preparedness", "Biosecurity"),
            ("Career Capital", "Career-Capital"),
            ("Mental Health", "Mental Health & Wellbeing"),
        ],
    )
    def test_cause_areas(self, old, new):
        assert _map_tag_name(old) == new

    # role types — case normalization
    def test_role_type_case(self):
        assert _map_tag_name("Full-time") == "Full-Time"
        assert _map_tag_name("Part-time") == "Part-Time"

    # education
    @pytest.mark.parametrize(
        "old, new",
        [
            ("Doctoral degree", "Doctoral Degree"),
            ("Master's degree", "Master's Degree"),
            ("Undergraduate degree", "Undergraduate Degree or Less"),
        ],
    )
    def test_education(self, old, new):
        assert _map_tag_name(old) == new

    # experience — completely different format
    @pytest.mark.parametrize(
        "old, new",
        [
            ("Entry-level", "Entry-Level"),
            ("Junior (1-4 years experience)", "Junior (1\u20134y)"),
            ("Mid (5-9 years experience)", "Mid (5\u20139y)"),
            ("Senior (10+ years experience)", "Senior (10y+)"),
        ],
    )
    def test_experience(self, old, new):
        assert _map_tag_name(old) == new

    # skills
    @pytest.mark.parametrize(
        "old, new",
        [
            ("Content & Communications", "Communications & Outreach"),
            ("Outreach", "Communications & Outreach"),
        ],
    )
    def test_skills(self, old, new):
        assert _map_tag_name(old) == new

    # values with no canonical match pass through
    @pytest.mark.parametrize("name", ["Other", "Profit for Good", "No education requirement"])
    def test_no_match_passthrough(self, name):
        assert _map_tag_name(name) == name

    # values already canonical pass through
    @pytest.mark.parametrize("name", ["Full-Time", "Biosecurity", "Research", "Data"])
    def test_canonical_passthrough(self, name):
        assert _map_tag_name(name) == name


class TestCsvImportJobAlerts(NeuronTestCase):
    async def test_import_full_csv(self):
        stats = await csv_import_job_alerts(CSV_PATH)

        assert stats.created == 927
        assert await JobAlert.objects.acount() == 927

        assert await PostTag.objects.acount() > 0
        assert await JobLocation.objects.acount() > 0

        # spot-check first row — tags mapped to canonical names
        alert = await JobAlert.objects.order_by("pk").afirst()
        assert alert is not None
        assert alert.email == "sabrina+GlobalHealth@probablygood.org"
        assert alert.is_active is False
        assert alert.is_remote is False
        assert alert.is_orgs_highlighted is False
        assert alert.salary_min is None

        tags = [t.name async for t in alert.tags.all()]
        assert "Global Health & Development" in tags
        assert "Master's Degree" in tags  # was "Master's degree"
        assert "Doctoral Degree" in tags  # was "Doctoral degree"

        # spot-check row with salary + locations (has "Canada, Global" — Global is invalid)
        alert_with_salary = await JobAlert.objects.filter(
            email="annya11@hotmail.com",
        ).afirst()
        assert alert_with_salary is not None
        assert alert_with_salary.salary_min == 0
        assert alert_with_salary.is_remote is False
        assert alert_with_salary.is_invalid_location is True
        assert alert_with_salary.is_active is False

        locs = [loc.name async for loc in alert_with_salary.locations.all()]
        assert "Canada" in locs
        assert "Global" not in locs

        role_tags = [t.name async for t in alert_with_salary.tags.all()]
        assert "Full-Time" in role_tags  # was "Full-time"
        assert "Part-Time" in role_tags  # was "Part-time"

        # spot-check "United States (USA)" → "USA"
        alert_remote = await JobAlert.objects.filter(
            email="ganesharentals269@gmail.com",
        ).afirst()
        assert alert_remote is not None
        assert alert_remote.is_remote is True
        assert alert_remote.is_invalid_location is False

        locs_remote = [loc.name async for loc in alert_remote.locations.all()]
        assert "USA" in locs_remote

        # spot-check "United Kingdom (UK)" → "UK"
        alert_uk = await JobAlert.objects.filter(
            email="edjhenley17@gmail.com",
        ).afirst()
        assert alert_uk is not None
        locs_uk = [loc.name async for loc in alert_uk.locations.all()]
        assert "UK" in locs_uk

        # duplicate emails create separate alerts
        dup_count = await JobAlert.objects.filter(email="nassehis@yahoo.co.uk").acount()
        assert dup_count > 1

        # highlighted orgs
        highlighted_count = await JobAlert.objects.filter(is_orgs_highlighted=True).acount()
        assert highlighted_count == 18

        # invalid location stats
        assert stats.invalid_location == 112
        invalid_db_count = await JobAlert.objects.filter(is_invalid_location=True).acount()
        assert invalid_db_count == 112
