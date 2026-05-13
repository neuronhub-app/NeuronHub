# Code Search

Never read the GraphQL generated types (schema.graphql, graphql-env.d.ts, persisted-queries.json) - they're excluded from Git diff and grep/ripgrep.

You must use `rg` instead of `grep`, which excludes blob files from `.ignore`.

For code search and refactor prefer to use the installed `ast-grep` over `rg`.

For file search you must use `fd` instead of `find`.
