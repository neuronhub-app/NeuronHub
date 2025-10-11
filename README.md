For project description see [docs/architecture.md](/docs/architecture.md).

Development Setup
--------------------------------

The complete env setup you can find in [Coder.com Dockerfile](/devops/coder/Dockerfile).

Install `Mise`, then:
```shell
mise install
mise install-deps
mise django:migrate
mise django:stubs-repopulate
mise dev
```

URLs
- http://localhost:7999/admin
- http://localhost:2999

Read [mise.toml](/mise.toml) for more.

### Code style

- [testing setup](/docs/testing-setup.md)
- [code style](/docs/code-style.md)
