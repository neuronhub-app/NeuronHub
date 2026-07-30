from unittest.mock import AsyncMock
from unittest.mock import patch

from django.test import override_settings

from neuronhub.apps.jobs.services.subscribe_to_mailerlite import subscribe_to_mailerlite
from neuronhub.apps.jobs.services.utm import UtmParamsInput
from neuronhub.apps.tests.test_cases import NeuronTestCase


@override_settings(PG_MAILERLITE_API="test-key")
class TestSubscribeToMailerlite(NeuronTestCase):
    async def test_sends_only_non_empty_utm_as_extra_fields(self):
        with patch(_create_subscriber_path, AsyncMock(return_value=True)) as create_subscriber:
            await subscribe_to_mailerlite(_email, utm=UtmParamsInput(utm_source="linkedin"))

        create_subscriber.assert_awaited_once_with(
            _email, extra_fields={"utm_source": "linkedin"}
        )


_email = "user@example.com"
_create_subscriber_path = (
    "neuronhub.apps.jobs.services.subscribe_to_mailerlite._create_subscriber"
)
