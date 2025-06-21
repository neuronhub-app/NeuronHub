---
reviewed_at: 2025.06.17
---

### Setup

- `cd server/`
- `uv init`
- `uv sync`
- install postgres. For MacOS:
  - `brew isntall postgres`
  - `brew services start postgres@16`
    - `createuser neuronhub`
    - `createdb neuronhub --owner=neuronhub`
- `uv run manage.py migrate`
- `uv run manage.py createsuperuser --username=admin`
- `uv run manage.py db_stubs_repopulate`
  - For local or preview usage. Drops all data except the users, then creates few posts, reviews, comments, tags, etc. Designed to populate db with realistic data.
- `uv run manage.py runserver`
- `uv run pytest`

Remember to run `uv` from `server/` dir.

Extra:
- `uv run ruff format .`
- `uv run manage.py export_schema neuronhub.graphql --path=schema.graphql` - make sure it's in root, not `server/graphql.schema`
- `./run/gen-types-and-format.sh`
  - format by Ruff → gen types for schema.graphql, graphql-codegen, gql.tada, chakra-ui → format by Biome 
- `uv lock --upgrade`
