## Docker Compose

Replace all the ${{}}` placeholders below.

### App

```yaml
name: neuronhub

services:
  server:
    image: ghcr.io/neuronhub-app/neuronhub/server:${{major_tag}}
    command: bash -c "uv run manage.py migrate && uv run daphne --bind 0.0.0.0 --port ${{server=8000}} neuronhub.asgi:application"
    env_file:
      - path: .env
    ports:
      - "${{server=8000}}:${{server=8000}}"
    pull_policy: always
  client:
    image: ghcr.io/neuronhub-app/neuronhub/client:${{major_tag}}
    env_file:
      - path: .env
    ports:
      - "${{client=3000}}:${{client=3000}}"
    pull_policy: always
```

`.env` file
```shell
# Django
# ========================================================

DJANGO_ENV=prod
DATABASE_URL=postgresql://${{db_user}}:${{db_password}}@${{db_host}}:${{db_port}}/${{db_name}}
SECRET_KEY=${{django_secret}}

SERVER_URL=https://backend.${{domain}}
CLIENT_URL=https://${{domain}}

# S3
# --------------------------------------------
AWS_S3_ENDPOINT_URL=${{host}}:${{port}}
AWS_ACCESS_KEY_ID=${{key_id}}
AWS_SECRET_ACCESS_KEY=${{key_secret}}


# Client
# ========================================================

VITE_SERVER_URL=https://backend.${{domain}}


# Sentry
# ========================================================

SENTRY_DSN_BACKEND=${{dsn_backend}}
SENTRY_DSN_FRONTEND=${{dsn_frontend}}
```

### Postgres 17 database

At your discretion.

### S3 Rclone server

Create a dir for s3 like `mkdir -p /srv/neuronhub/storage/` - the `storage` name is hardcoded in Django.

```yaml
services:
  rclone:
    image: rclone/rclone
    volumes:
      - /srv/neuronhub/storage/config:/config/rclone
      - /srv/neuronhub/storage/data/storage/data:/data
    env_file:
      - path: .env
    command: serve s3 --auth-key ${ACCESS_KEY_ID},${SECRET_ACCESS_KEY} /data --addr :${{port}}
    ports:
      - "${{port}}:${{port}}"
    expose:
      - "${{port}}"
```

`.env` file
```shell
ACCESS_KEY_ID=${{key_id}}
SECRET_ACCESS_KEY=${{key_secret}}
```

### Hatchet.run (background jobs)

```yaml
  hatchet-postgres:
    image: postgres:15.6
    command: postgres -c 'max_connections=200'
    restart: always
    env_file:
      - path: .env
    environment:
      - POSTGRES_USER=hatchet
      - POSTGRES_DB=hatchet
    volumes:
      - hatchet_postgres_data:/var/lib/postgresql/data
    ports:
      - "${{db_port_hatchet}}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d hatchet -U hatchet"]
      interval: 2s
      timeout: 2s
      retries: 3
      start_period: 3s
  hatchet-lite:
    image: ghcr.io/hatchet-dev/hatchet/hatchet-lite:latest
    ports:
      - "8888:8888" # web panel
      - "7077:7077" # worker
    depends_on:
      hatchet-postgres:
        condition: service_healthy
    environment:
      # see https://docs.hatchet.run/self-hosting/configuration-options
      SERVER_AUTH_COOKIE_DOMAIN: localhost
      SERVER_AUTH_COOKIE_INSECURE: "t"
      SERVER_GRPC_BIND_ADDRESS: "0.0.0.0"
      SERVER_GRPC_INSECURE: "t"
      SERVER_GRPC_BROADCAST_ADDRESS: localhost:7077
      SERVER_GRPC_PORT: "7077"
      SERVER_URL: http://0.0.0.0:8888
      SERVER_AUTH_SET_EMAIL_VERIFIED: "t"
      SERVER_DEFAULT_ENGINE_VERSION: "V1"
      SERVER_INTERNAL_CLIENT_INTERNAL_GRPC_BROADCAST_ADDRESS: localhost:7077
    volumes:
      - "hatchet_config:/config"
```

`.env` file
```shell
POSTGRES_PASSWORD=${{db_password_hatchet}}
DATABASE_URL="postgresql://hatchet:hatchet@${{db_password_hatchet}}:${{db_port_hatchet}}/hatchet?sslmode=disable"
```


## Upgrades

Watch out for the `BREAKING CHANGE` notes in the release descriptions - it's specifically for self-hosting.

You can use `:latest` docker tag, but I advice to hardcode the non-breaking release eg `1.1`, as the two last numbers are for non-breaking changes, ie `1.1.2.2` won't break your deployment.
