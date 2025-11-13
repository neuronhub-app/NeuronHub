The annotations (`//`) specs are in [[pyproject.toml]]

- use-debounce [i=norm, rep=norm, GH=norm, @xnimorz, 3.3k] an SWE at Meta
- valtio [i=norm, rep=high, GH=high, @dai-shi, 10k]
- shiki [i=none, rep=high, GH=high, @octref | @antfu, 12k] Nuxt & Vercel member

### Frozen versions

`graphql` is frozen on ~16.9, because `gql.tada` devs inappropriately copy-pasted chunks of `graphql` types into its codebase (eg Document.Kind), and upgrading `graphql` to latest (eg 16.12) breaks all `graphql.persisted()` typing.
