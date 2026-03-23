## Desc

We're adding a primitive CMS for Jobs FAQ and site Header.

Focus on the unchecked tasks.

### Tasks
- [x] replace `NavLinkSection.Footer*` with `NavLinkSection.FooterColumn` and a shared model `SiteFooterColumn` that has `SiteNavLink` inlines with `FooterSection.*`, and a field `.title: str`. Use adminsortable2.
- [x] Replace the `SOCIAL_ICON_SRC` with a dynamic list of icons and `react-icons` by:
      ```python
      class NavLinkIcon(TextChoices):
          Email = "email"
          Matrix = "matrix"
          Mastodon = "mastodon"
          ...
      ```
- [x] refactor
    - `SiteNavLink` -> `HeaderLink`
    - `SiteFooterColumn` -> `FooterSection` that has `FooterLink` (and only it must have `.icon`)
- [x] fix `client/src/sites/pg/PgLayout.tsx` by using a proper query `query { site: { nav_links {...} footer_sections {...} } }`
- [x] Squash migrations 0006-0013
- [x] Fix e2e to support `env.VITE_SITE`
- [x] add `adminsortable2` to `FooterSection`
- [x] refactor: add `FooterSection` as inline to `SiteConfig`. Remove FK to `SiteConfig`.
- [x] debug the pytest error of `server/neuronhub/apps/sites/graphql__test.py`
- [x] for VITE_SITE=pg hardcode the `light` theme, and ignore the system theme
- [x] fix JobCard invisible links - instead make the JobCard open
- [x] hover on JobCard, facets, "clear all filters", search input
- [x] reduce the CLS on PgAlgoliaList
    - it shows "Search not available" - but must show skeletons to match and remove the shit.
    - use docs/e2e/tests/content-layout-shift.spec.ts as a base. Expect almost 0 CLS.
- [x] `Showing 0 out of 18 jobs` - replace `0` with SkeletonText, 4 numbers-wide.
- [x] make JobCard hover with light border

Create a feedback loop through E2E and target-sized screenshots -> make a subagent review the screenshots and report.

## Relevant-Files

- client/src/sites/pg/components/PgAlgoliaList.tsx - skeleton, CLS fix, ClearAllFiltersButton hover
- client/src/sites/pg/components/PgFiltersTopbar.tsx - 10 facets in Grid(5,1fr) layout
- client/src/sites/pg/components/PgSearchInput.tsx - search input (h="10")
- client/src/sites/pg/components/PgFacetPopover.tsx - facet trigger Button(size="md")
- client/src/sites/pg/pages/jobs/list/JobCard.tsx - card open/hover, external links
- client/src/sites/pg/pages/jobs/list/JobList.tsx - PgAlgoliaList consumer, Contact link
- client/src/sites/pg/PgLayout.tsx - nav/footer links, external link attrs
- client/src/utils/useAlgoliaSearchClient.ts - algolia init, loading state
- client/src/utils/useInit.ts - has bug: finally{} resets isLoading immediately
- client/e2e/tests/nav-links-CLS.spec.ts - CLS e2e test (currently has debug code)
- docs/e2e/tests/content-layout-shift.spec.ts - reference CLS test

## Decision-Log

- Issue: e2e subscribe btn "not visible"
    - Root: PgAlgoliaList rendered CTA twice (mobile+desktop), same testid
    - Fix: `ids.job.alert.subscribeBtnMobile`
- Fix: `Prose` overrides style.answer + link colors
    - `css={{ ...style.answer, "& a": style.link }}`
    - `style.link` fontSize/lineHeight override `Prose`'s `& a` defaults
- Refac: Squash 0006-0013; add `RunPython` for `SiteConfig` population
- Fix: `query SiteConfig` -> `query SiteConfigQuery` (op name must match persisted key)
- e2e and `VITE_SITE`
    - Fix: playwright.config.ts testIgnore NHA-only specs if `VITE_SITE=pg`
    - Fix: baseURL uses urls.jobs.list (/) for pg
- Feat: `FooterSection` `SortableAdminMixin`
- Refac: `FooterSection` SortableTabularInline with show_change_link
- Refac: drop `FooterLink.site` FK
- Fix: replace pytest `--no-migrations` with `--reuse-db`
    - `no-migrations` creates db by inspecting models - ie skips `RunPython()`
- Fix: JobCard click opens card instead of `window.open(url_external)`
    - "Job Details" button in expanded card handles external nav
- Fix: hover `_hover={{ borderColor: "fg.muted" }}` on JobCard, facets, search
- Issue: CLS on PgAlgoliaList
    - Root: skeleton->real transition caused footer to bounce in/out of viewport
    - Fix: `minH="100vh"` on `<Stack as="main">` in PgLayout [quiet stupid]
      => footer stays below viewport during transitions, CLS 0.35 -> 0.006
    - Fix: `useInit` bug — `finally{}` reset `isLoading` for async [I confirmed the issue]
    - Fix: `PgSearchStats` — `Skeleton` for "Showing 0" initial load
    - Fix: CLS e2e test — follows docs/ pattern, no debug code
- Fix: PgSearchStats "Showing 0" CLS
    - `stats.processingTimeMS === 0` detects pre-first-search state
    - Skeleton `w="4ch"` reserves space for number
