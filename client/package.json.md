The annotations (`//`) specs are in [[pyproject.toml]]

- use-debounce [i=norm, rep=norm, GH=norm, @xnimorz, 3.3k] an SWE at Meta
- react-error-boundary [i=high, rep=high, GH=high, @bvaughn, 7.8k] React core at Meta
- valtio [i=norm, rep=high, GH=high, @dai-shi, 10k]
- shiki [i=none, rep=high, GH=high, @octref | @antfu, 12k] Nuxt & Vercel member

### Frozen versions

`graphql` is frozen on ~16.9, because `gql.tada` devs inappropriately copy-pasted chunks of `graphql` types into its codebase (eg Document.Kind), and upgrading `graphql` to latest (eg 16.12 or 16.13) breaks all `graphql.persisted()` typing.

### Promoted transitive deps (for Docker) #AI #123

Bun Workspace only symlinks **direct** deps to `client/node_modules/`. Transitive deps in `node_modules/.bun/` are unreachable by Node/Rollup/Babel in Docker. These are promoted from transitive to direct:

- `@ark-ui/react` — transitive of `@chakra-ui/react`, imported in `theme/recipes.ts`
- `@sentry/react` — transitive of `@sentry/react-router`, imported in ~15 files
- `diff` — transitive of `diff2html`, imported in `JobVersionReview.tsx`
- `@babel/preset-typescript` (dev) — transitive of `@vitejs/plugin-react`, resolved by babel at runtime
