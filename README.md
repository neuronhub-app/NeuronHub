### Setup

For complete dev env see [Coder's Dockerfile](/devops/coder/Dockerfile).

Install `Mise`, then:
```shell
mise install
mise install-deps
mise django:migrate
mise django:stubs-repopulate
mise dev
```

URLs
- http://localhost:8000/admin
- http://localhost:3000

Read [mise.toml](/mise.toml) for more.

### Main docs

- [architecture](/docs/architecture.md)
- [testing setup](/docs/testing-setup.md)
