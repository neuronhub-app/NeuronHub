## Desc

We're adding a primitive CMS for Jobs FAQ and site Header.

Focus on the unchecked task.

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

## Relevant-Files

- server/neuronhub/apps/jobs/models.py - JobFaqQuestion (MarkdownField, order, FK to `site`)
- server/neuronhub/apps/jobs/graphql.py - JobFaqQuestionType + query
- server/neuronhub/apps/sites/models.py
- server/neuronhub/apps/sites/admin.py
- client/src/apps/jobs/faq/JobFaqPage.tsx - GraphQL + Prose + markedConfigured
- client/src/sites/pg/components/PgAlgoliaList.tsx - `ctaMobile` prop
- docs/src/pages/usage/reference/database-tables/JobFaqQuestion.mdx - docs

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
- Fix: User.mdx hardcoded URL -> `env.VITE_SERVER_URL`
