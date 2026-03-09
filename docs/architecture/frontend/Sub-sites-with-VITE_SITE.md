`env.VITE_SITE: "" | "pg"`

Defined in mise.toml, values:
- `""` - default for `neuronhub.app`
- `"pg"` - job board only for `jobs.probablygood.org`

Each site has its own dir `src/sites/{value}/` with:
- `routes.ts` - `RouteConfig` specifying its own `layout()` - `NeuronLayout.tsx` or `PgLayout.tsx`
- `theme.ts`

`src/sites/index.ts` hold `SiteConfig` with chakra `theme` and `favicon` paths.

The only conditional url namespace is `/jobs/`, which isn't used in `pg`, as it's their homepage. Hence `pg` URLs transform as:
- `/jobs` -> `/`
- `/jobs/:slug` -> `/:slug`
- etc

This is temporarily solution - in ~3 months we're planning to extract it into an NPM package `neuronhub`, and a git repository `neuronhub-template` with the standard minimal `server/` Django setup and `client/` dir.
