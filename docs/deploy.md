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
    restart: always
    pull_policy: always
  server_db_worker:
	image: ghcr.io/neuronhub-app/neuronhub/server:${{major_tag}}
    command: bash -c "uv run manage.py db_worker"
    env_file:
      - path: .env
    pull_policy: always
	restart: always
    depends_on:
      server:
        condition: service_started
  client:
    image: ghcr.io/neuronhub-app/neuronhub/client:${{major_tag}}
    env_file:
      - path: .env
    ports:
      - "${{client=3000}}:${{client=3000}}"
	restart: always
    pull_policy: always
```

`.env` file
```shell
# Django
DJANGO_ENV=prod
DATABASE_URL=postgresql://${{db_user}}:${{db_password}}@${{db_host}}:${{db_port}}/${{db_name}}
SECRET_KEY=${{django_secret}}

SERVER_DOMAIN=backend.${{domain}}
SERVER_URL=https://${{SERVER_DOMAIN}}

CLIENT_DOMAIN=${{domain}}
CLIENT_URL=https://${{CLIENT_DOMAIN}}

# S3
AWS_S3_ENDPOINT_URL=${{host}}:${{s3_port}}
AWS_ACCESS_KEY_ID=${{s3_key_id}}
AWS_SECRET_ACCESS_KEY=${{s3_key_secret}}


# Client
VITE_SERVER_URL=https://backend.${{domain}}


# Sentry
SENTRY_DSN_BACKEND=${{dsn_backend}}
SENTRY_DSN_FRONTEND=${{dsn_frontend}}

# Algolia
ALGOLIA_IS_ENABLED="true"
ALGOLIA_API_KEY="${{algolia_write_key}}"
ALGOLIA_APPLICATION_ID="${{algolia_app_id}}"
ALGOLIA_SEARCH_API_KEY="${{algolia_search_key}}"
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
ACCESS_KEY_ID=${{s3_key_id}}
SECRET_ACCESS_KEY=${{s3_key_secret}}
```

### Algolia setup

I recommend creating `ALGOLIA_API_KEY` and `ALGOLIA_SEARCH_API_KEY` that are limited to `Indices: *_prod*` in [the key settings](https://dashboard.algolia.com/account/api-keys/restricted) instead of using the global Write/Search API keys.

After the first deploy, connect to the `server` docker container, and run:
- `cd /app/; uv run manage.py algolia_reindex`

## Upgrades

Watch out for the `BREAKING CHANGE` notes in the release descriptions - it's specifically for self-hosting.

You can use `:latest` docker tag, but I advice to hardcode the non-breaking release eg `1.1`, as the two last numbers are for non-breaking changes, ie `1.1.2.2` won't break your deployment.

## Caveats

### Vite prod is calling "localhost"

If you're building the images for deploy with eg `mise docker:build --app=client` and `mise docker:tag-and-push --app=client`, Mise might not supply your envs vars from `mise.local.toml`, and you'll have to override `mise.toml` `[env].SERVER_DOMAIN` manually.

(Likely Mise bugs, have seen several lately re envs)
