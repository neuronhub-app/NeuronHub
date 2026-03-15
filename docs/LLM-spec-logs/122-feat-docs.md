## Desc

We're setting up a docs.neuronhub.app website using React Router v7 (with SSR only in docs/, not client/), Chakra-UI Pro components, and MDX.

It's mimicking `client/` setup, but isolated from its source code.

An LLM did several passes - you focus on the last unchecked task.

### Tasks
- Read all relevant frontend `docs/`:
    - code-style.md
    - code-style-detailed.md
    - docs/architecture/frontend/Chakra-UI.md
    - docs/architecture/frontend/React-component-structure.md
- [x] Install dependencies in package.json, similar to client/package.json
- [x] Setup Chakra UI Pro layout.
- [x] Setup `client/src/theme/theme.ts`.
- [x] Add `@mdx-js/rollup` to vite plugins for `.mdx` route files
- [x] split `Toc.tsx` out of DocsLayout.tsx
- [x] make Toc.tsx dynamic
- [x] make left sidebar dynamic based on the `pages/` dirs and mdx files
- [x] using as an example (though a trash-style comparing to our code guidelines) docs/src/chakra-raw/sidebar-002 - add Logo (same logo as client/), and 2 sections using Tabs: Usage and Development
    - [x] link logo to env.CLIENT_URL
    - note: NavigationDropdown to be replaced with the Tabs example
    - remove sidebar-002 once you're done
    - don't need to make it dynamic - it'll only be 2 tabs, ie two folders. (we'll rename `user` to `usage` later)
- we need several libs from client/ (eg `useStateValtio`, `format`, etc, maybe `env` if doable) - analyze how hard would it be to publish `client/` as an NPM package and use here. read why we're publishing it in docs/architecture/frontend/Sub-sites-with-VITE_SITE.md.
    - [x] basic setup
    - [x] try to fix the chakra types issue by specifying its `--outdir` param
    - [x] chakra typegen overrides (hoisted pkg)
    - [x] make biome.jsonc global
    - [x] fix mise lint:docs
    - [x] fix @neuronhub/shared missing imports
    - [x] add chakra spacings from client/ to shared/
- [x] code review

The changes are in the 2 git commits:
- `refac: simplify client/tsconfig.json`
- `feat(docs): add /packages/shares and Bun Workspace #122`

### Related files
- `docs/package.json`
- `docs/tsconfig.json`
- `docs/vite.config.ts`
- `docs/react-router.config.ts`: `ssr: true`
- `docs/src/root.tsx`
- `docs/src/routes.ts`
- `docs/src/components/DocsLayout.tsx`
- `docs/src/components/Toc.tsx`
- `docs/src/pages/user/{section}/{file}.mdx` - MDX doc drafts
- `docs/src/pages/user/how-to/deploy.mdx` - longest file at the moment
- `docs/e2e/tests/docs-pages.spec.ts`
- `docs/e2e/playwright.config.ts`
- `package.json` - root Bun workspaces
- `packages/shared/package.json` - peerDeps, exports
- `packages/shared/tsconfig.json`
- `packages/shared/src/createEnv.ts`
- `packages/shared/src/utils/useStateValtio.ts`
- `packages/shared/src/utils/format.ts`
- `packages/shared/src/utils/date-fns.ts`
- `packages/shared/src/utils/marked-configured.ts`
- `packages/shared/src/theme/colors.ts`
- `packages/shared/src/components/ui/prose.tsx`
- `packages/shared/src/components/NeuronLogo.tsx`

## Exec-Plan

<LLM_unverified_report>

### CTO requirements (added/clarified during session)
- Chakra spacing tokens must use standard string props (`gap="gap.sm"`), not variable imports
- No `@ts-expect-error` for the Bleed.inline issue - the original code worked in client/ before the move to shared/
- CTO says: "primitive issue - the rest of the chakra types (as colors) were working already. most likely something was messed up in the first few steps"
- Must only run Mise tasks, never raw commands

### What was done (prev sessions)
1. `docs/tsconfig.json`: added `skipLibCheck: true` → `mise lint:docs` passes
2. `client/src/components/LayoutSidebar.tsx`: fixed barrel import `from "@neuronhub/shared"` → `from "@neuronhub/shared/components/NeuronLogo"`
3. Created `packages/shared/src/theme/spacings.ts` with `gap` tokens extracted from `client/src/theme/theme.ts`
4. Created `packages/shared/src/theme/theme.ts` (minimal theme for typegen)
5. Updated `docs/src/theme/theme.ts` to import `gap` and register spacing semantic tokens
6. Updated `client/src/theme/theme.ts`: removed local `gap` definition, imports from shared
7. Updated 3 client files to import `gap` from `@neuronhub/shared/theme/spacings` instead of `@/theme/theme`
8. Added `typegen:packages:chakra` task to `mise.toml` (runs from client/ dir since shared has no chakra CLI)
9. Fixed trailing commas in `packages/shared/package.json`

### What was done (this session)
10. NeuronLogo.tsx: `FlexProps` → `BleedProps`, string token props
11. shared/tsconfig: `#chakra-internal/*` path + `.chakra/types` include
12. DocsLayout.tsx: added `<SectionTabs>` call in SidebarContent

</LLM_unverified_report>

## Decision-Log
- Workspaces: /package.json; /packages/shared/
- Fix: NeuronLogo deduplicated
- Issue: `import.meta.env` in shared/
    - Fix: `/// <reference types="vite/client" />` to types.d.ts
- Issue: trash rel include in client/tsconfig.json
    - Fix: dropped unused `"../packages/shared/src"`
        - `@neuronhub/shared: workspace:*` covers it
- Issue: chakra typegen overrides (hoisted pkg)
    - Fix: `--outdir .chakra/types` + Nushell post-process
        - sed `from "../` → `from "#chakra-internal/`
- Issue: `lint:docs` tsgo fails on `@types/mdx` JSX ns
    - Fix/types: `skipLibCheck: true` to docs/tsconfig.json
- Fix: LayoutSidebar barrel import → specific path
- Issue: gap spacings must share across sites
    - Fix: `typegen:packages:chakra` in mise.toml
    - Fix: `spacings.ts` and `theme.ts`
    - Fix: trailing comma in shared/package.json broke chakra
- Issue: Bleed `inline` tsgo error in NeuronLogo.tsx
    - Root: `FlexProps` spread into `<Bleed>`
    - shared/tsconfig: added `#chakra-internal/*` path
      + `.chakra/types` include (for future)
- Code Review
    - Fix: inlined `serverEnv` in createEnv
    - Fix: `sectionTabs` `as const satisfies` + `SectionKey` type
    - Fix: removed redundant `isProd` getter in docs/env.ts
    - Fix: mise sources paths lacked dir prefix
    - Issue: dup valtio/react decl in client/ and shared/ types.d.ts
        - Keep both: shared's not picked up by client tsgo
