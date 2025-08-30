from django.conf import settings
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.urls import re_path
from django.views.decorators.csrf import csrf_exempt
from django.views.static import serve
from strawberry.django.views import AsyncGraphQLView

from neuronhub.graphql import schema
from neuronhub.settings import DjangoEnv


graphql_view = AsyncGraphQLView.as_view(
    schema=schema,
    graphql_ide="graphiql" if settings.DJANGO_ENV == DjangoEnv.LOCAL else None,
)
urlpatterns = [
    path("admin/", admin.site.urls),
    path("select2/", include("django_select2.urls")),
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
    path("healthcheck/", include("health_check.urls")),
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


if settings.DJANGO_ENV in (DjangoEnv.LOCAL, DjangoEnv.BUILD):
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
