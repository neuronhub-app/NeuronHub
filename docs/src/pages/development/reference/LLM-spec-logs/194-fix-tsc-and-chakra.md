## Desc

We're trying to fix @chakra-cli typegen either overriding the global types when `env.VITE_SITE="pg"`, 
or the `tsgo` linting complaining about `src/sites/pg/` "invalid" chakra types when `env.VITE_SITE=""`.

At the moment I've been trying to modify `mise.toml` `lint:client` and created `tsconfig.nha.json`, but `pnpm exec tsgo --noEmit --project tsconfig.nha.json` still errors on `src/sites/pg` files.

Don't read the `tsgo` output directly to avoid context rot - use `rg` over it instead.

Either continue find a better approach, or fix that potential direction - whatever.

## Relevant-Files

- `client/src/theme/theme.typegen.ts` (new) - combined NHA+pg recipe variants; only consumed by `mise typegen:chakra`
- `mise.toml` - `typegen:chakra` (rewritten), `typegen:client` (chakra dep dropped); old `typegen:packages:chakra`, `typegen:docs:chakra` removed; `lint:client` simplified
- `client/tsconfig.json`, `packages/shared/tsconfig.json`, `docs/tsconfig.json` - dropped `.chakra/types` include + `#chakra-internal/*` path
- `docs/scripts/lint-mdx.ts` - dropped `.chakra/types` from include
- `docs/architecture/frontend/README.md` - updated chakra typegen description
- DELETED: `client/tsconfig.nha.json`, `{client,packages/shared,docs}/.chakra/`

## Exec-Plan

Done — `mise lint` clean. `VITE_SITE=""` + `VITE_SITE=pg` both pass `mise lint:client`.

## Decision-Log

- approach: combined typegen theme + drop orphan `--outdir` scaffolding
- root cause: chakra-ui internals `import "./generated/recipes.gen"` (relative) -> only `node_modules/.../generated/` is consulted. `--outdir .chakra/types/` + `#chakra-internal/*` paths were orphaned (never read).
    - validated: typegen w/ `--outdir` leaves node_modules mtime stale; w/o `--outdir` updates it and tsgo sees new variants.
- pnpm dedupes `@chakra-ui/react`: client + packages/shared + docs symlink to ONE physical install -> ONE typegen run covers all three.
- pg theme NOT strict superset (container/link drop chakra defaults; NHA uses `<Link variant="underline">`) -> `theme.typegen.ts` spreads NHA recipes + adds pg variant keys; leaves link/container untouched so chakra defaults flow.
- tradeoff: drift risk — new pg recipe variant needs mirror in `theme.typegen.ts`. Single file, easy to grep.
- value-irrelevant: typegen reads variant KEYS only -> `{}` placeholders.
- no token additions needed in combined theme: only recipe-variant errors surfaced; chakra default token typing is loose enough.
