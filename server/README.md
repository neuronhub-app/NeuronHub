---
reviewed_at: 2025.07.06
---

## Setup

```bash
cd server/
uv init
uv sync
```

PostgreSQL:
```bash
brew install postgres@17
brew services start postgres@17
createuser neuronhub
createdb neuronhub --owner=neuronhub
```

Django:
```bash
uv run manage.py migrate
uv run manage.py db_stubs_repopulate  # populate with test data, incl the test user admin/admin
uv run manage.py runserver
uv run pytest
```

Run `uv` from `server/` dir.

## Additional Commands

- Format: `mise format-server`
- GraphQL types hard reset: `mise graphql-gen`
- Upgrade: `mise upgrade-server`
