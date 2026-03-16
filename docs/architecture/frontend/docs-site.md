## Docs Site (`docs/`)

docs.neuronhub.app — standalone React Router v7 app with SSR, MDX, and Chakra UI Pro.

Mirrors `client/` setup but is isolated from its source code. Shared code lives in `packages/shared/` (`@neuronhub/shared`).

### Structure

- [[docs/react-router.config.ts]] — `ssr: true`
- [[docs/vite.config.ts]]
- [[docs/src/routes.ts]] — flat glob of `pages/**/*.mdx` → route entries. Reads YAML frontmatter at build time via `node:fs`. Also generates dir redirect routes to the first child.
- `docs/src/pages/` — `user/`, `development/`
- `docs/e2e/` — Playwright `mise e2e:docs`

### Components

- [[DocsLayout.tsx]] — sidebar with section switcher (Usage / Development), recursive `NavTreeList`, mobile drawer, and right-side `Toc`
    - depth 0: section headings (clickable if `href` exists); depth 1+: indented `SideNavLink`s; branches without `href`: plain `Text` labels
- [[Toc.tsx]] — ToC from `[data-toc-root]` headings
- [[frontmatter.ts]] — Zod schema: `{ title?, slug?, order?, description?, reviewed_at? }`
- [[buildNavTree.ts]] — builds recursive `NavNode[]` tree from `import.meta.glob` of MDX modules
    - `README.mdx` merges into parent dir node (gives it `href`)
    - Sort: by `.order` — tiebreak by `.title`
- [[dir-redirect.tsx]] — SSR `loader` that `redirect()`s dir paths to first child leaf
