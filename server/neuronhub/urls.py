from django.conf import settings
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.urls import re_path
from django.views.decorators.csrf import csrf_exempt
from django.views.static import serve
from health_check.views import HealthCheckView
from strawberry.django.views import AsyncGraphQLView

from neuronhub.apps.profiles.views import accept_invite
from neuronhub.graphql import schema


graphql_view = AsyncGraphQLView.as_view(
    schema=schema,
    graphql_ide="graphiql" if settings.DJANGO_ENV.is_dev() else None,
    multipart_uploads_enabled=True,  # required for File upload (according to the docs)
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path(
        "api/",
        include(
            [
                path("graphql", csrf_exempt(graphql_view)),
                # extra for [[client.ts#fetchUsingReadableUrl]]
                path("graphql/<operation>", csrf_exempt(graphql_view)),
                path("graphql/mutate/<operation>", csrf_exempt(graphql_view)),
            ]
        ),
    ),
    path("profiles/accept-invite/<uuid:token>", accept_invite, name="profiles_accept_invite"),
    path(
        "healthcheck/",
        HealthCheckView.as_view(
            checks=[
                "health_check.Cache",
                "health_check.Database",
                "health_check.Storage",
                "health_check.contrib.psutil.Disk",
                "health_check.contrib.psutil.Memory",
                "health_check.contrib.celery.Ping",
            ]
        ),
    ),
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {
            "document_root": settings.MEDIA_ROOT,
        },
    ),
]


if settings.IS_DEBUG_TOOLBAR_ENABLED:
    from debug_toolbar.toolbar import debug_toolbar_urls

    urlpatterns += debug_toolbar_urls()


if settings.DJANGO_ENV.is_dev():
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
