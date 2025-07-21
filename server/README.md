---
reviewed_at: 2025.07.21
---

## Setup

```bash
mise install
mise install-deps
mise db-migrate
mise db-stubs-repopulate  # populate with test data, incl the test user admin/admin
mise dev-server
mise pytest
```

GraphQL + TS full rebuild: `mise gen-graphql`


### PostgreSQL native
```fish
brew install postgres@17
brew services start postgres@17
createuser neuronhub
createdb neuronhub --owner=neuronhub
```
