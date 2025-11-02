For project intro see [docs/architecture.md](/docs/architecture.md).

Development Setup
--------------------------------

### Linux & Docker

1. Install [Mise](https://mise.jdx.dev/getting-started.html)
2. `git clone {url}`
3. `cd neuronhub`
4. ```shell
	mise trust
	mise install
	mise run install-deps
	mise run dev:db-init # FYI its db_stubs_repopulate takes few minutes 
	mise run dev
	```

dev URLs:
- http://localhost:8000/admin
- http://localhost:3000

### MacOS

To run without Docker, after `git clone` copy this env file:
- `cp devops/env-examples/mise.macos.toml.example mise.local.toml`

The rest of steps are the same as for Linux.

The [mise.toml](/mise.toml) has all tasks and scripts.

Documentation
--------------------------------

- [testing setup](/docs/testing-setup.md)
- [code style](/docs/code-style.md)

For more see the [docs/](/docs/) dir.
