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
from strawberry_django.settings import StrawberryDjangoSettings


django_stubs_ext.monkeypatch()

BASE_DIR = Path(__file__).resolve().parent.parent

env = Env()
env.read_env()


class DjangoEnv(Enum):
    BUILD = "build"
    LOCAL = "local"
    STAGE = "stage"
    PROD = "prod"


DJANGO_ENV = DjangoEnv(env.str("DJANGO_ENV", DjangoEnv.LOCAL.value))

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
    DEBUG_TOOLBAR_PANELS = [
        "debug_toolbar.panels.history.HistoryPanel",
        "debug_toolbar.panels.versions.VersionsPanel",
        "debug_toolbar.panels.timer.TimerPanel",
        "debug_toolbar.panels.settings.SettingsPanel",
        "debug_toolbar.panels.headers.HeadersPanel",
        "debug_toolbar.panels.request.RequestPanel",
        "debug_toolbar.panels.sql.SQLPanel",
        "debug_toolbar.panels.staticfiles.StaticFilesPanel",
        "debug_toolbar.panels.templates.TemplatesPanel",
        "debug_toolbar.panels.cache.CachePanel",
        "debug_toolbar.panels.signals.SignalsPanel",
        "debug_toolbar.panels.redirects.RedirectsPanel",
        "debug_toolbar.panels.profiling.ProfilingPanel",
    ]
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "neuronhub/templates"],
        "APP_DIRS": True,
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

if DJANGO_ENV == DjangoEnv.BUILD:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        },
    }
else:
    db_host = env.str("DATABASE_HOST", "host.docker.internal")
    db_user = env.str("DATABASE_USER", "neuronhub")
    db_name = env.str("DATABASE_NAME", "neuronhub")
    if env.bool("E2E_TEST", False):
        db_name = env.str("E2E_DB_NAME")
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            default=env.str(
                "DATABASE_URL",
                f"postgres://{db_user}@{db_host}:5432/{db_name}",
            ),
        )
    }

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_L10N = False  # to make admin dates readable
USE_I18N = True
USE_TZ = True
DATETIME_FORMAT = "Y.m.d H:i"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SITE_ID = 1

STATIC_URL = "static/"
ROOT_URLCONF = "neuronhub.urls"

SERVER_PORT = env.int("SERVER_PORT", 8000)
SERVER_URL = env.str("SERVER_URL", f"http://localhost:{SERVER_PORT}")
CLIENT_URL = env.str("CLIENT_URL", "http://localhost:3000")
DOMAIN = env.str("DOMAIN", CLIENT_URL.replace("https://", "").replace("http://", ""))
DOMAIN_PROD = "neuronhub.io"

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

TEST_RUNNER = "django_rich.test.RichRunner"

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
# in E2E Mise `--quite` doesn't work on runserver, and `--silent` drops stderr
if env.bool("IS_DJANGO_RUNSERVER_STDERR_ONLY", False):
    LOGGING["handlers"]["null"] = {"class": "logging.NullHandler"}
    LOGGING["loggers"] = {
        "django.server": {
            "handlers": ["null"],
            "level": "INFO",
            "propagate": False,
        },
        # keep stderr
        "django": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": True,
        },
    }

_line_width = 120
rich.traceback.install(
    width=_line_width,  # max-width=100vw, so who cares
    code_width=_line_width,
    show_locals=True,
    locals_max_length=1,  # crop vars to 1 newline, eg cls
    locals_max_string=_line_width,
    suppress=[django],  # hide Dango's locals - it's too verbose
)


DEFAULT_DJANGO_SETTINGS = StrawberryDjangoSettings(
    FIELD_DESCRIPTION_FROM_HELP_TEXT=True,
    TYPE_DESCRIPTION_FROM_MODEL_DOCSTRING=True,
    GENERATE_ENUMS_FROM_CHOICES=True,
    MUTATIONS_DEFAULT_ARGUMENT_NAME="data",
    MUTATIONS_DEFAULT_HANDLE_ERRORS=False,
    MAP_AUTO_ID_AS_GLOBAL_ID=False,
    DEFAULT_PK_FIELD_NAME="id",  # default is "pk" - nice intention, but dumb - "id" is soft-required in django, alas
    USE_DEPRECATED_FILTERS=False,
    PAGINATION_DEFAULT_LIMIT=300,
    ALLOW_MUTATIONS_WITHOUT_FILTERS=False,
)
