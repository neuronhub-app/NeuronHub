# todo maybe: Dockerfiles for prod /server/ for lesser image size
FROM mcr.microsoft.com/playwright/python:v1.53.0-noble

RUN pip install uv --quiet --disable-pip-version-check

WORKDIR /app/server

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

CMD ["uv", "run", "daphne", "--bind", "0.0.0.0", "--port", "8000", "neuronhub.asgi:application"]
