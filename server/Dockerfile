FROM astral/uv:python3.14-bookworm

ARG SERVER_PORT=8000
ARG GITHUB_PATH
ARG VITE_RELEASE_VERSION

# Sentry
ARG SENTRY_PROJECT
ARG SENTRY_DSN_BACKEND
ARG VITE_RELEASE_NAME

ENV VITE_RELEASE_VERSION=$VITE_RELEASE_VERSION
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_DSN_BACKEND=$SENTRY_DSN_BACKEND
ENV VITE_RELEASE_NAME=$VITE_RELEASE_NAME

LABEL org.opencontainers.image.description="Daphne serving Django ASGI"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/server/Dockerfile"
LABEL org.opencontainers.image.version="$VITE_RELEASE_VERSION"


RUN apt update && apt install ca-certificates --yes # for Sentry

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

COPY . ./

RUN DJANGO_ENV=collectstatic uv run manage.py collectstatic

CMD ["uv", "run", "daphne", "--bind", "0.0.0.0", "--port", "$SERVER_PORT", "neuronhub.asgi:application"]
