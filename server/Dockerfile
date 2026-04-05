FROM astral/uv:python3.14-bookworm

ARG SERVER_PORT=8000
ARG GITHUB_PATH
ARG VITE_RELEASE_VERSION
ARG DJANGO_ENV="prod"

# Sentry
ARG SENTRY_PROJECT
ARG SENTRY_DSN_BACKEND
ARG VITE_RELEASE_NAME

ENV DJANGO_ENV=$DJANGO_ENV
ENV VITE_RELEASE_VERSION=$VITE_RELEASE_VERSION
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_DSN_BACKEND=$SENTRY_DSN_BACKEND
ENV VITE_RELEASE_NAME=$VITE_RELEASE_NAME

LABEL org.opencontainers.image.description="Daphne serving Django ASGI"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_PATH}/blob/${VITE_RELEASE_VERSION}/server/Dockerfile"
LABEL org.opencontainers.image.version="$VITE_RELEASE_VERSION"


RUN apt update
RUN apt install --yes ca-certificates  # for Sentry

# For SSH
RUN apt install --yes fish bat nano micro
RUN ln --symbolic /usr/bin/batcat /usr/bin/bat
ENV PAGER=bat
RUN usermod --shell /usr/bin/fish root
RUN mkdir -p /root/.config/fish && echo 'cd /app' >> /root/.config/fish/config.fish
ARG WORKDIR=/app
RUN mkdir -p /$USER/.config/fish && echo "cd ${WORKDIR}" >> /$USER/.config/fish/config.fish


WORKDIR ${WORKDIR}

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

COPY . ./

RUN DJANGO_ENV=collectstatic uv run manage.py collectstatic

CMD ["uv", "run", "daphne", "--bind", "0.0.0.0", "--port", "$SERVER_PORT", "neuronhub.asgi:application"]
