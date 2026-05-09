# Code Search

You don't need to read noisy files generated for GraphQL (schema.graphql, graphql-env.d.ts, persisted-queries.json) - they're excluded from Git diff and ripgrep.

You must use `rg` instead of `grep`, to exclude GraphQL files by `.ignore`. Exclusions are already setup by the ripgrep config.

For code search and refactor prefer to use the installed `ast-grep` over `rg`.
