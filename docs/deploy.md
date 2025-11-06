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
DATABASE_URL=postgresql://${{user}}:${{password}}@${{host}}:${{port}}/${{db_name}}
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

### S3 server

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

## Upgrades

Watch out for the `BREAKING CHANGE` notes in the release descriptions - it's specifically for self-hosting.

You can use `:latest` docker tag, but I advice to hardcode the non-breaking release eg `1.3`, as the two last numbers are for non-breaking changes, ie `1.3.15.1` won't break your deployment.
