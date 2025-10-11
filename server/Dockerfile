FROM astral/uv:python3.13-bookworm

LABEL org.opencontainers.image.source="https://github.com/neuronhub-app/neuronhub"

WORKDIR /app

# cache deps
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

COPY . ./

RUN uv run manage.py collectstatic

CMD ["uv", "run", "daphne", "--bind", "0.0.0.0", "--port", "8000", "neuronhub.asgi:application"]
