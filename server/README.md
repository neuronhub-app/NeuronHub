---
reviewed_at: 2025.06.17
---

### Setup

- `uv init`
- `uv sync`
- `brew isntall postgres@16`
- `brew services start postgres@16`
  - `createuser neuronhub`
  - `createdb neuronhub --owner=neuronhub`
- `uv run python manage.py migrate`
- `uv run python manage.py createsuperuser --username=admin`
- `uv run python manage.py db_stubs_repopulate`
  - drops all records except the users → creates few posts, reviews, comments, tags, etc
- `uv run python manage.py runserver`
- `uv run pytest`


Extra
- `./run/gen-types-and-format.sh`
  - format w Ruff → gen schema.graphql, graphql-codegen, gql.tada, chakra-ui types → format w Biome 
- `uv lock --upgrade`
