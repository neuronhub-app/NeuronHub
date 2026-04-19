"""
#quality-25% #AI
"""

from unittest.mock import patch

from neuronhub.apps.jobs.services import airtable_sync_orgs
from neuronhub.apps.jobs.services.airtable_sync_orgs import _parse_airtable_record
from neuronhub.apps.jobs.services.airtable_sync_orgs import _parse_logo_field
from neuronhub.apps.jobs.services.airtable_sync_orgs import airtable_sync_orgs as sync_orgs
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.tests.test_cases import NeuronTestCase


class TestAirtableSyncOrgs(NeuronTestCase):
    async def test_tags_area_are_shared_with_other_orgs(self):
        # Pre-existing tag is reused by the Airtable sync (not duplicated).
        tag_area = await self.gen.posts.tag(category=TagCategoryEnum.Area)
        org_name = "NewOrg"
        records = [
            {
                "id": f"rec_{org_name}",
                "fields": {
                    "Name": org_name,
                    "Org Cause Area": tag_area.name,
                },
            }
        ]
        with patch.object(airtable_sync_orgs, "_fetch_airtable_records", return_value=records):
            await sync_orgs(is_download_logos=False)

        org = await Org.objects.aget(name=org_name)
        assert 1 == await org.tags_area.acount()

    def test_extracts_domain_without_www(self):
        domain = "example.co.uk"
        record = {"id": "rec", "fields": {"Name": "X", "Website": f"https://www.{domain}/path"}}
        assert domain == _parse_airtable_record(record)["domain"]


class TestParseLogoField:
    def test_filename_and_url(self):
        filename = "Logo.webp"
        url = "https://airtableusercontent.com/xyz/abc"
        assert (filename, url) == _parse_logo_field(f"{filename} ({url})")

    def test_returns_none_for_unparseable(self):
        assert _parse_logo_field("") is None
        assert _parse_logo_field("no url here") is None
