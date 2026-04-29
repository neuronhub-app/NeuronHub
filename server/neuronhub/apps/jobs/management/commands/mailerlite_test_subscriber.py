import json

import httpxyz
from django.conf import settings
from django.core.management.base import BaseCommand


API_BASE = "https://connect.mailerlite.com/api"
TEST_GROUP_ID = "126961089287030545"
TEST_EMAIL = "viktor+test@neuronhub.app"


class Command(BaseCommand):
    help = "Upsert -> read -> delete a subscriber against MailerLite Test Group."

    def handle(self, *args, **options):
        api_key = settings.PG_MAILERLITE_API
        assert api_key, "PG_MAILERLITE_API not set"

        headers = {"Authorization": f"Bearer {api_key}"}
        with httpxyz.Client(headers=headers, timeout=30.0) as client:
            self._step(
                client,
                "POST /subscribers",
                "POST",
                "/subscribers",
                {
                    "email": TEST_EMAIL,
                    "groups": [TEST_GROUP_ID],
                    "status": "active",
                },
            )
            r = self._step(
                client, "GET /subscribers/{email}", "GET", f"/subscribers/{TEST_EMAIL}"
            )
            sub_id = r.json()["data"]["id"]
            self._step(client, "DELETE /subscribers/{id}", "DELETE", f"/subscribers/{sub_id}")

    def _step(self, client, label: str, method: str, path: str, payload: dict | None = None):
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== {label} ==="))
        r = client.request(method, f"{API_BASE}{path}", json=payload)
        self.stdout.write(f"status={r.status_code}")
        try:
            self.stdout.write(json.dumps(r.json(), indent=2))
        except Exception:
            self.stdout.write(r.text[:2000])
        return r
