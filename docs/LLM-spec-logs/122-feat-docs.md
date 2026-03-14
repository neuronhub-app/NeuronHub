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
- [x] make left sidebar dynamic based on the `pages/` dirs and mdx files

### Related files
- `docs/package.json`
- `docs/tsconfig.json`
- `docs/vite.config.ts`
- `docs/react-router.config.ts`
- `docs/src/root.tsx`
- `docs/src/routes.ts`
- `docs/src/components/DocsLayout.tsx`
- `docs/src/components/Toc.tsx`
- `docs/src/components/Prose.tsx`
- `docs/src/pages/user/{section}/{file}.mdx` - MDX doc drafts
- `docs/src/pages/user/how-to/deploy.mdx` - longest file at the moment
- `docs/react-router.config.ts`: `ssr: true`

## Exec-Plan p1

Done. Dynamic Toc.tsx:
1. Added `rehype-slug` → auto heading IDs in MDX
2. `data-toc-root` attr on `<Prose>` in DocsLayout → DOM scan boundary
3. `useHeadingItems(pathname)` → scans `[data-toc-root]` for `h1-h4[id]` on route change
4. `useScrollSpy(ids)` → scroll-position based (finds last heading above 30% viewport threshold). Replaced IntersectionObserver which highlighted wrong sections on long content.
5. Click → `history.replaceState` for URL hash + `scrollIntoView`
6. E2E: renders 3 headings on analytics; click updates hash + active state on deploy

## Exec-Plan p2

Toc.tsx dynamic highlighting — current state:
1. `rehype-slug` in vite.config → auto heading IDs
2. `data-toc-root` + `pb="100vh"` on Prose → scan boundary + bottom scroll room
3. `useHeadingItems(pathname)` → DOM scan on route change
4. `useScrollSpy(items)` → returns `Set<string>` of visible heading IDs
5. Logic: highlight all headings visible in viewport. Fallback to last heading past viewport top when no headings visible (long sections).

Remaining: implement the visible-headings approach + tests.

## Exec-Plan p3

Done. Used P2 (import.meta.glob + MDX frontmatter) + P4 (useLocation for active state):
1. Installed `remark-mdx-frontmatter`, added to vite.config.ts
2. Added `title` frontmatter to all 6 MDX files
3. `import.meta.glob("../pages/user/**/*.mdx", { eager: true })` → `buildNavGroups()` at module level
4. Groups from dir names (toTitleCase), titles from frontmatter (fallback: toTitleCase of filename)
5. `useLocation().pathname` for active `data-current` state
6. Fixed route slug mismatch: `/how-to/job-emails` → `/how-to/job-emails-sending`
7. Added `data-sidebar` attr for E2E targeting
8. 3 new E2E tests: group rendering, active link, active link on different page
9. All 15 E2E tests pass

## Mistakes-Log p2

Problems encountered during scroll spy implementation:

1. **IntersectionObserver race on click**: smooth scroll fires observer for headings passing through viewport → wrong heading highlighted mid-scroll. Fix: don't use IO for TOC.
2. **"Last heading past threshold" model**: picked deepest child instead of the section heading. When S3 server (h3) is at viewport top and Rclone (h4) is 40px below, both pass threshold → Rclone wins because it's last. Wrong.
3. **"Closest to viewport top" model**: better, but still single-heading. User sees 3 headings on screen, only 1 highlighted.
4. **Ancestor highlighting**: walked backwards to find parent h2 → highlighted Docker Compose even when scrolled way off-screen. Every major docs site only highlights visible headings, not structural parents.
5. **`innerHeight * 0.3` threshold**: unpredictable magic number. Different results on different viewports. Replaced with fixed 100px, then realized the whole "pick one" model was wrong.
6. **Bottom-of-page headings**: can't scroll to viewport top if not enough content below. Fix: `pb="100vh"` on Prose container — CSS solution, not JS hack.
7. **`useStableItems` over-engineering**: `useState` already returns stable refs between renders. The hook solved a non-existent problem.
8. **`forceActive` / `idForced` ref**: JS hack to override scroll spy on click. Eliminated by `pb="100vh"` padding.
9. **Code style violations**: JSDoc comments, section divider comments, wrong props ordering, `export default` on non-route component, interface defined above usage.

Core mistake: kept trying to pick ONE "active" heading instead of asking "which headings can the user see?"

## Thinking-Log

- Need to implement: highlight all headings in viewport (0 <= top < viewportHeight). Fallback: last heading past top when no headings visible.
- Return `Set<string>` from `useScrollSpy`.
- Update tests: expect multiple `[data-current]` links when multiple headings visible.
