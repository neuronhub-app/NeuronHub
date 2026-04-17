from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.models import UserAnon


class TestUserAnon(NeuronTestCase):
    async def test_deterministic_by_email(self):
        anon1 = await UserAnon.get_or_create_from_email("alice@mail.com")
        anon2 = await UserAnon.get_or_create_from_email("alice@mail.com")
        assert anon1.pk == anon2.pk
        assert anon1.anon_name == anon2.anon_name

    async def test_different_emails(self):
        anon1 = await UserAnon.get_or_create_from_email("alice@mail.com")
        anon2 = await UserAnon.get_or_create_from_email("bob@mail.com")
        assert anon1.anon_name != anon2.anon_name
        assert anon1.email_hash != anon2.email_hash
