---
reviewed_at: 2025.07.20
---

## Setup

```bash
mise install
mise install-server
mise migrate
mise db_stubs_repopulate  # populate with test data, incl the test user admin/admin
mise run-server
mise test
```

### PostgreSQL native
```fish
brew install postgres@17
brew services start postgres@17
createuser neuronhub
createdb neuronhub --owner=neuronhub
```

## Additional Commands

- Format: `mise format-server`
- GraphQL types hard reset: `mise graphql-gen`
- Upgrade: `mise upgrade-server`
