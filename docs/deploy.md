## Docker Compose

Replace all the `${{}}` placeholders below.

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
AWS_S3_ENDPOINT_URL=${{host}}:${{s3_port}}
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

### Rclone S3 server

To create Rclone "S3 bucket" you need to create a dir, eg `mkdir -p /srv/neuronhub/media/data/media`.

Note: `media` is the bucket name expected by Django's settings.py `env.str("S3_STORAGE_BUCKET_NAME", "media")`.

```yaml
services:
  rclone:
    image: rclone/rclone
    volumes:
      - /srv/neuronhub/media/config:/config/rclone
      - /srv/neuronhub/media/data:/data
    env_file:
      - path: .env
    command: serve s3 --auth-key ${ACCESS_KEY_ID},${SECRET_ACCESS_KEY} /data --addr :${{s3_port}}
    ports:
      - "${{s3_port}}:${{s3_port}}"
    expose:
      - "${{s3_port}}"
```

`.env` file
```shell
ACCESS_KEY_ID=${{key_id}}
SECRET_ACCESS_KEY=${{key_secret}}
```

## Upgrades

Watch out for the `BREAKING CHANGE` notes in the release descriptions - it's specifically for self-hosting.

You can use `:latest` docker tag, but I advice to hardcode the non-breaking release eg `1.1`, as the two last numbers are for non-breaking changes, ie `1.1.2.2` won't break your deployment.
