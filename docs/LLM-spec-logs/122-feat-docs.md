## Desc

We're setting up a docs.neuronhub.app website using React Router v7 (with SSR only in docs/, not client/), Chakra-UI Pro components, and MDX.

It's mimicking `client/` setup, but isolated from its source code.

An LLM did a first pass, focus on the unchecked tasks.

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
- [x] make Toc.tsx actually dynamic
- [ ] using as an example (though a trash-style comparing to our code guidelines) docs/src/chakra-raw/sidebar-002 - add Logo (same logo as client/), and 2 sections using Tabs: Usage and Development
    - [ ] link logo to env.CLIENT_URL
    - note: NavigationDropdown to be replaced with the Tabs example
    - remove sidebar-002 once you're done

### Related files
- `docs/package.json`
- `docs/tsconfig.json`
- `docs/vite.config.ts`
- `docs/react-router.config.ts`: `ssr: true`
- `docs/src/root.tsx`
- `docs/src/routes.ts`
- `docs/src/components/DocsLayout.tsx`
- `docs/src/components/Toc.tsx`
- `docs/src/components/Prose.tsx`
- `docs/src/pages/user/{section}/{file}.mdx` - MDX doc drafts
- `docs/src/pages/user/how-to/deploy.mdx` - longest file at the moment
- `docs/e2e/tests/docs-pages.spec.ts`
- `docs/e2e/playwright.config.ts`

## Exec-Plan

1. Create `docs/src/env.ts` with `VITE_CLIENT_URL`
2. Add NeuronLogo to DocsLayout sidebar (PiGraph icon + "NeuronHub" text, links to env.CLIENT_URL)
3. Replace NavigationDropdown with Tabs (Usage / Development) - hardcoded 2 tabs
4. Wire Usage tab to show current navGroups, Development tab empty placeholder
5. Remove `docs/src/chakra-raw/sidebar-002/`
6. Clean up unused imports/code (TabsDemo, navigationDropdownOptions)
7. Run `mise lint`, verify, run e2e

## Thinking-Log

- Read all relevant docs and source files
- Client logo uses PiGraph from react-icons/pi + "NeuronHub" text + Alpha badge
- Tabs pattern already exists as TabsDemo in DocsLayout.tsx - will adapt it
- buildNavGroups already handles dynamic nav - tabs just wrap it

### Related files
- `docs/package.json`
- `docs/tsconfig.json`
- `docs/vite.config.ts`
- `docs/react-router.config.ts`: `ssr: true`
- `docs/src/root.tsx`
- `docs/src/routes.ts`
- `docs/src/components/DocsLayout.tsx`
- `docs/src/components/Toc.tsx`
- `docs/src/components/Prose.tsx`
- `docs/src/pages/user/{section}/{file}.mdx` - MDX doc drafts
- `docs/src/pages/user/how-to/deploy.mdx` - longest file at the moment
- `docs/e2e/tests/docs-pages.spec.ts`
- `docs/e2e/playwright.config.ts`
