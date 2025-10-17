For project description see [docs/architecture.md](/docs/architecture.md).

Development Setup
--------------------------------

The complete env setup you can find in [Coder.com Dockerfile](/devops/coder/Dockerfile).

### MacOS

Install [Mise](https://mise.jdx.dev/getting-started.html), then:

```shell
cp devops/env-examples/mise.macos.toml.example mise.local.toml
```

Then follow the Linux steps below.

### Linux

```shell
mise install
mise run install-deps
mise run dev:db-init
mise run dev
```

URLs
- http://localhost:7999/admin
- http://localhost:2999

Read [mise.toml](/mise.toml) for more.

### Code style

- [testing setup](/docs/testing-setup.md)
- [code style](/docs/code-style.md)
