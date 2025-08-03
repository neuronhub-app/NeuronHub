---
reviewed_at: 2025.08.02
---

### Setup

For complete env setup see [Coder.com Dockerfile](/devops/coder/Dockerfile).

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

### Docs

- [architecture](/docs/architecture.md)
- [testing setup](/docs/testing-setup.md)
- [code style](/docs/code-style.md)
