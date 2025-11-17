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


env = Env()
env.read_env()


class DjangoEnv(Enum):
    STAGE = "stage"
    PROD = "prod"
    BUILD = "build"

    DEV = "dev"
    DEV_TEST_UNIT = "dev_test_unit"
    DEV_TEST_E2E = "dev_test_e2e"

    def is_dev(self) -> bool:
        return self in {
            DjangoEnv.DEV,
            DjangoEnv.DEV_TEST_UNIT,
            DjangoEnv.DEV_TEST_E2E,
        }


DJANGO_ENV = DjangoEnv(env.str("DJANGO_ENV", DjangoEnv.DEV.value))  # todo ! default to PROD

BASE_DIR = Path(__file__).resolve().parent.parent

if DJANGO_ENV.is_dev():
    load_dotenv(os.path.join(BASE_DIR, ".env.local"), override=True)

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

if DJANGO_ENV is DjangoEnv.BUILD:
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
    db_pass = env.str("DATABASE_PASSWORD", db_name)
    if DJANGO_ENV is DjangoEnv.DEV_TEST_E2E:
        db_name = env.str("E2E_DB_NAME")
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            default=env.str(
                "DATABASE_URL",
                f"postgres://{db_user}:{db_pass}@{db_host}:5432/{db_name}",
            ),
        )
    }

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "django_cache_table",
        "OPTIONS": {
            "TIMEOUT": None,  # only used in E2E tests atm, no need to expire
            "MAX_ENTRIES": 2000,
        },
    }
}

SITE_ID = 1

SECRET_KEY = env.str(
    "SECRET_KEY", "django-insecure-u_nt^p$$c611a&(jd*wbs58ziu4=o3%ps%@4zpv9=(8ix&8k7i"
)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DEBUG = env.bool("DJANGO_DEBUG", DJANGO_ENV.is_dev())

LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Los_Angeles"
USE_L10N = False  # for django.admin
USE_I18N = True
USE_TZ = True
DATETIME_FORMAT = "Y.m.d H:i"

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
ROOT_URLCONF = "neuronhub.urls"


# ALLOWED_HOSTS & django-cors-headers
# ---------------------------------------------------------------------------------------------------------

SERVER_PORT = env.int("SERVER_PORT", 8000)
SERVER_URL = env.str("SERVER_URL", f"http://localhost:{SERVER_PORT}")
CLIENT_URL = env.str("CLIENT_URL", "http://localhost:3000")
DOMAIN = env.str("DOMAIN", CLIENT_URL.replace("https://", "").replace("http://", ""))
DOMAIN_NAME = env.str("DOMAIN_NAME", "neuronhub.app")

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

# for Sentry traces
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


# Storage
# ---------------------------------------------------------------------------------------------------------

AWS_ACCESS_KEY_ID = env.str("AWS_ACCESS_KEY_ID", "any")
AWS_SECRET_ACCESS_KEY = env.str("AWS_SECRET_ACCESS_KEY", "any")
S3_STORAGE_BUCKET_NAME = env.str("S3_STORAGE_BUCKET_NAME", "media")
AWS_STORAGE_BUCKET_NAME = S3_STORAGE_BUCKET_NAME
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


# Email
# ---------------------------------------------------------------------------------------------------------

EMAIL_BACKEND = env.str("EMAIL_BACKEND", "anymail.backends.postmark.EmailBackend")
EMAIL_USE_TLS = True
ANYMAIL = {
    "POSTMARK_SERVER_TOKEN": env.str("POSTMARK_SERVER_TOKEN", ""),
}


DEFAULT_DJANGO_SETTINGS = strawberry_django_settings()
DEFAULT_DJANGO_SETTINGS["GENERATE_ENUMS_FROM_CHOICES"] = True  # no reason atm, can remove
# "pk" by default is a nice idea, but bad implementation - "id" is soft-required in Django
DEFAULT_DJANGO_SETTINGS["DEFAULT_PK_FIELD_NAME"] = "id"


# django.auth + django-allauth
# ---------------------------------------------------------------------------------------------------------

AUTH_USER_MODEL = "users.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]
LOGIN_REDIRECT_URL = CLIENT_URL

SESSION_COOKIE_DOMAIN = env.str("SESSION_COOKIE_DOMAIN", None)
# SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", False) # todo !! [auth] enable
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 3600 * 24 * 30  # 1 month

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
    # "guardian.backends.ObjectPermissionBackend", todo mb: they lacks async support - see django-guardian#808 (planned for v3.3)
]

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
if DJANGO_ENV.is_dev():
    ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http"


# Logging
# ---------------------------------------------------------------------------------------------------------

IS_SENTRY_ENABLED = env.bool("IS_SENTRY_ENABLED", not DJANGO_ENV.is_dev())
if IS_SENTRY_ENABLED:
    sentry_sdk.init(
        dsn=env.str("SENTRY_DSN_BACKEND", ""),
        send_default_pii=True,  # IP is excluded
        enable_logs=True,
        traces_sample_rate=0.5,
        profile_session_sample_rate=0.5,
        profile_lifecycle="trace",
        integrations=[
            StrawberryIntegration(async_execution=True),
        ],
        release=env.str("VITE_RELEASE_NAME", ""),
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
if DJANGO_ENV is DjangoEnv.DEV_TEST_E2E:
    # Mise's `--quite` doesn't work on `runserver`, and `--silent` drops all stderr - so we set django to WARNING instead of INFO
    LOGGING["loggers"] = {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": True,
        },
    }
    # supress asyncio.CancelledError: it's raised by Strawberry historically for no reason. See their github for details
    LOGGING.setdefault("filters", {})
    LOGGING["filters"]["suppress_cancelled"] = {
        "()": "django.utils.log.CallbackFilter",
        "callback": lambda record: not (
            record.exc_info and record.exc_info[0] == asyncio.exceptions.CancelledError
        ),
    }
    # noinspection PyTypeChecker
    LOGGING["handlers"]["console"]["filters"] = ["suppress_cancelled"]


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
