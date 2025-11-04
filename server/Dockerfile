FROM astral/uv:python3.14-bookworm

LABEL org.opencontainers.image.source="https://github.com/neuronhub-app/neuronhub/blob/master/server/Dockerfile"
LABEL org.opencontainers.image.description="Daphne serving Django ASGI"

RUN apt update && apt install ca-certificates --yes # for Sentry

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

COPY . ./

RUN uv run manage.py collectstatic

CMD ["uv", "run", "daphne", "--bind", "0.0.0.0", "--port", "8000", "neuronhub.asgi:application"]
