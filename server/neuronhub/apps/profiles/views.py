from http import HTTPStatus

from django.conf import settings
from django.contrib.auth import login
from django.db import transaction
from django.http import HttpRequest
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.utils import timezone

from neuronhub.apps.profiles.models import ProfileGroup
from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.users.models import User


@transaction.atomic
def accept_invite(request: HttpRequest, token: str):
    invite = (
        ProfileInvite.objects.select_related("profile")
        .filter(token=token, accepted_at__isnull=True)
        .first()
    )
    if not invite:
        return JsonResponse(
            {"error": "Invalid or already accepted token"}, status=HTTPStatus.UNAUTHORIZED
        )

    if invite.profile.user:
        return JsonResponse(
            {"error": "Profile already linked to a user"}, status=HTTPStatus.UNAUTHORIZED
        )

    profile_group, _ = ProfileGroup.objects.get_or_create(name=settings.CONF_CONFIG.eag_group)  # type: ignore[has-type]
    invite.profile.groups.add(profile_group)
    invite.profile.user = User.objects.create(
        email=invite.user_email,
        username=invite.user_email.split("@")[0],
    )
    invite.profile.save()

    invite.accepted_at = timezone.now()
    invite.save()

    login(
        request=request,
        user=invite.profile.user,
        backend="allauth.account.auth_backends.AuthenticationBackend",
    )

    return HttpResponseRedirect(settings.CLIENT_URL)
