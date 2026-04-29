import json

import httpxyz
from django.conf import settings
from django.core.management.base import BaseCommand

API_BASE = "https://connect.mailerlite.com/api"


class Command(BaseCommand):
    help = (
        "Explore MailerLite API. Pass endpoints as args, e.g. `mailerlite_explore /automations`."
    )

    def add_arguments(self, parser):
        parser.add_argument("paths", nargs="+")

    def handle(self, *args, **options):
        api_key = settings.PG_MAILERLITE_API
        if not api_key:
            self.stderr.write("PG_MAILERLITE_API not set")
            return

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        }

        with httpxyz.Client(headers=headers, timeout=30.0) as client:
            for path in options["paths"]:
                params = {"limit": 50}
                self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== GET {path} {params} ==="))
                r = client.get(f"{API_BASE}{path}", params=params)
                self.stdout.write(f"status={r.status_code}")
                try:
                    self.stdout.write(json.dumps(r.json(), indent=2))
                except Exception:
                    self.stdout.write(r.text[:2000])
