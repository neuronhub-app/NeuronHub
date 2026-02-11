from http import HTTPStatus
from typing import cast

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.utils import timezone

from neuronhub.apps.profiles.models import ProfileInvite
from neuronhub.apps.users.models import User


@login_required
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

    request_user = cast(User, request.user)
    invite.profile.user = request_user
    invite.profile.save()

    invite.accepted_at = timezone.now()
    invite.save()

    return HttpResponseRedirect(settings.CLIENT_URL)
