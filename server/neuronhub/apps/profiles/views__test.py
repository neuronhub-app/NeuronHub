import uuid
from http import HTTPStatus

from asgiref.sync import sync_to_async
from django.test import Client
from django.urls import reverse

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.models import User


class AcceptInviteTest(NeuronTestCase):
    async def test_accept_invite_links_profile(self):
        user = await self.gen.users.user()
        profile = await self.gen.profiles.profile(user=None, visibility=Visibility.PRIVATE)
        invite = await self.gen.profiles.invite(profile=profile, user_email=user.email)
        assert invite.accepted_at is None

        response = await _login_and_accept(user, token=invite.token)
        assert response.status_code == HTTPStatus.FOUND

        await invite.arefresh_from_db()
        assert invite.accepted_at is not None

        await profile.arefresh_from_db()
        assert profile.user_id == user.id

    async def test_reject_invalid_token(self):
        user = await self.gen.users.user()
        response = await _login_and_accept(user, token=uuid.uuid4())
        assert response.status_code == HTTPStatus.UNAUTHORIZED

    async def test_reject_already_accepted(self):
        user = await self.gen.users.user()
        profile = await self.gen.profiles.profile(user=None, visibility=Visibility.PRIVATE)
        invite = await self.gen.profiles.invite(profile=profile, user_email=user.email)

        await _login_and_accept(user, token=invite.token)

        other_user = await self.gen.users.user()
        response = await _login_and_accept(other_user, token=invite.token)
        assert response.status_code == HTTPStatus.UNAUTHORIZED


def _login_and_accept_invite_sync(user: User, token: str):
    client = Client()
    client.force_login(user)
    return client.get(reverse("profiles_accept_invite", args=[token]))


_login_and_accept = sync_to_async(_login_and_accept_invite_sync)
