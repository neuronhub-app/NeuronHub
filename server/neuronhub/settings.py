import asyncio
import os
from enum import Enum
from pathlib import Path

import dj_database_url
import django
import django_stubs_ext
import rich.traceback
import sentry_sdk
from corsheaders.defaults import default_headers
from dotenv import load_dotenv
from environs import Env
from sentry_sdk.integrations.strawberry import StrawberryIntegration
from strawberry_django.settings import strawberry_django_settings

django_stubs_ext.monkeypatch()

BASE_DIR = Path(__file__).resolve().parent.parent

env = Env()
env.read_env()


class DjangoEnv(Enum):
    BUILD = "build"
    LOCAL = "local"
    STAGE = "stage"
    PROD = "prod"


DJANGO_ENV = DjangoEnv(env.str("DJANGO_ENV", DjangoEnv.LOCAL.value))  # todo ! default to PROD

if DJANGO_ENV is DjangoEnv.LOCAL:
    load_dotenv(os.path.join(BASE_DIR, ".env.local"), override=True)

SECRET_KEY = env.str(
    "SECRET_KEY", "django-insecure-u_nt^p$$c611a&(jd*wbs58ziu4=o3%ps%@4zpv9=(8ix&8k7i"
)

DEBUG = env.bool("DJANGO_DEBUG", DJANGO_ENV not in (DjangoEnv.STAGE, DjangoEnv.PROD))

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.headless",
    "django_object_actions",
    "django_countries",
    "django_rich",
    "corsheaders",
    "anymail",
    "simple_history",
    "codemirror2",
    "strawberry_django",
    "health_check",
    "health_check.storage",
    "health_check.contrib.migrations",
    "neuronhub.apps.db",
    "neuronhub.apps.users",
    "neuronhub.apps.orgs",
    "neuronhub.apps.posts",
    "neuronhub.apps.tests",
    "neuronhub.apps.importer",
    "neuronhub.apps.highlighter",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
    "hijack.middleware.HijackUserMiddleware",
]

IS_DEBUG_TOOLBAR_ENABLED = env.bool("IS_DEBUG_TOOLBAR_ENABLED", False)
if IS_DEBUG_TOOLBAR_ENABLED:
    INSTALLED_APPS.append("debug_toolbar")
    MIDDLEWARE.insert(0, "strawberry_django.middlewares.debug_toolbar.DebugToolbarMiddleware")
    DEBUG_TOOLBAR_CONFIG = {
        "DISABLE_PANELS": {
            "debug_toolbar.panels.redirects.RedirectsPanel",
            "debug_toolbar.panels.alerts.AlertsPanel",
        },
        "RENDER_PANELS": True,
    }
    INTERNAL_IPS = ["127.0.0.1"]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "DIRS": [BASE_DIR / "neuronhub/templates"],
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "neuronhub.wsgi.application"
ASGI_APPLICATION = "neuronhub.asgi.application"

E2E_TEST = env.bool("E2E_TEST", False)
if DJANGO_ENV == DjangoEnv.BUILD:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        },
    }
else:
    db_host = env.str("DATABASE_HOST", "host.docker.internal")
    db_name = env.str("DATABASE_NAME", "neuronhub")
    db_user = env.str("DATABASE_USER", db_name)
    if E2E_TEST:
        db_name = env.str("E2E_DB_NAME")
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            default=env.str(
                "DATABASE_URL",
                f"postgres://{db_user}:{db_user}@{db_host}:5432/{db_name}",
            ),
        )
    }

LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Los_Angeles"
USE_L10N = False  # to make admin dates readable
USE_I18N = True
USE_TZ = True
DATETIME_FORMAT = "Y.m.d H:i"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SITE_ID = 1

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# SeaweedFS S3 #AI
AWS_ACCESS_KEY_ID = env.str("AWS_ACCESS_KEY_ID", "any")
AWS_SECRET_ACCESS_KEY = env.str("AWS_SECRET_ACCESS_KEY", "any")
AWS_STORAGE_BUCKET_NAME = "media"
AWS_S3_ENDPOINT_URL = env.str("AWS_S3_ENDPOINT_URL", "http://localhost:8333")
AWS_S3_USE_SSL = False
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = "public-read"
AWS_QUERYSTRING_AUTH = False
AWS_S3_ADDRESSING_STYLE = "path"
STORAGES = {
    "default": {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"

ROOT_URLCONF = "neuronhub.urls"

SERVER_PORT = env.int("SERVER_PORT", 8000)
SERVER_URL = env.str("SERVER_URL", f"http://localhost:{SERVER_PORT}")
CLIENT_URL = env.str("CLIENT_URL", "http://localhost:3000")
DOMAIN = env.str("DOMAIN", CLIENT_URL.replace("https://", "").replace("http://", ""))
DOMAIN_PROD = "neuronhub.app"

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOWED_ORIGINS = [
    SERVER_URL,
    SERVER_URL.replace("http://", "https://"),
    CLIENT_URL,
    CLIENT_URL.replace("http://", "https://"),
]
CORS_ALLOW_CREDENTIALS = True
CORS_URLS_REGEX = r"^/api/.*$"
CORS_EXPOSE_HEADERS = ["X-CSRFToken"]

SESSION_COOKIE_DOMAIN = env.str("SESSION_COOKIE_DOMAIN", None)
# SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", False) # todo !! [auth] enable
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 3600 * 24 * 30  # 1 month

CORS_ALLOW_HEADERS = (
    *default_headers,
    "baggage",
    "sentry-trace",
)
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        ".localhost",
        SERVER_URL.replace("http://", "").replace("https://", ""),
    ],
)
RENDER_EXTERNAL_HOSTNAME = env.str("RENDER_EXTERNAL_HOSTNAME", "")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

EMAIL_BACKEND = env.str("EMAIL_BACKEND", "anymail.backends.postmark.EmailBackend")
EMAIL_USE_TLS = True
ANYMAIL = {
    "POSTMARK_SERVER_TOKEN": env.str("POSTMARK_SERVER_TOKEN", ""),
}

AUTH_USER_MODEL = "users.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]
LOGIN_REDIRECT_URL = CLIENT_URL

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
    # "guardian.backends.ObjectPermissionBackend", todo feat: django-guardian breaks aauthenticate(), as they don't support async
]

# django-allauth
# todo ! [auth] enable 2FA
ACCOUNT_LOGIN_METHODS = {"username", "email"}
ACCOUNT_SIGNUP_FIELDS = ["username*", "password1*", "email"]  #: asterisk means required
ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = None
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = (
    ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL
)
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 7  # todo ! [auth] set 2d
ACCOUNT_EMAIL_SUBJECT_PREFIX = ""
ACCOUNT_CONFIRM_EMAIL_ON_GET = True  # todo ! [auth] check sec
ACCOUNT_LOGIN_ON_PASSWORD_RESET = True  # todo ! [auth] disable (≈ok, but we do secˆ)
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True  # todo ! [auth] disable
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
ACCOUNT_SESSION_REMEMBER = True
if DJANGO_ENV == DjangoEnv.LOCAL:
    ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http"

IS_SENTRY_ENABLED = env.bool(
    "IS_SENTRY_ENABLED", DJANGO_ENV in (DjangoEnv.PROD, DjangoEnv.STAGE)
)
if IS_SENTRY_ENABLED:
    sentry_sdk.init(
        dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
        send_default_pii=DJANGO_ENV is not DjangoEnv.PROD,
        integrations=[
            StrawberryIntegration(async_execution=True),
        ],
    )


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
if E2E_TEST:
    # Mise's `--quite` doesn't work on `runserver`, and `--silent` drops all stderr - so we set django to WARNING instead of INFO
    LOGGING["loggers"] = {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": True,
        },
    }

TEST_RUNNER = "django_rich.test.RichRunner"
_line_width = 120
rich.traceback.install(
    width=_line_width,  # default max-width=100vw, so who cares
    code_width=_line_width,
    show_locals=True,
    locals_max_length=2,  # amount of locals
    locals_max_string=_line_width,
    suppress=[django, asyncio],  # too verbose
)


DEFAULT_DJANGO_SETTINGS = strawberry_django_settings()
DEFAULT_DJANGO_SETTINGS["GENERATE_ENUMS_FROM_CHOICES"] = True  # no reason atm, can remove
# "pk" by default is a nice idea, but bad implementation - "id" is soft-required in django
DEFAULT_DJANGO_SETTINGS["DEFAULT_PK_FIELD_NAME"] = "id"
