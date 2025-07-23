### Setup

For complete dev env see [Coder's Dockerfile](/devops/coder/Dockerfile).

```shell
mise install
mise install-deps
mise db-migrate
mise db-stubs-repopulate
mise dev-start
```

URLs
- http://localhost:8000/admin
- http://localhost:3000

Read [mise.toml](/mise.toml) for more.

### Docs

- [architecture](/docs/architecture.md)
- [client/ caveats](/docs/client-caveats.md)
- [testing setup](/docs/testing-setup.md)
