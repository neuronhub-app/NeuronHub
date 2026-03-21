## Desc

Complete the task of `JobFaqQuestion`.

Use red/green TDD. Setup e2e.

## Relevant-Files

- server/neuronhub/apps/jobs/models.py - JobFaqQuestion (MarkdownField, order, site FK)
- server/neuronhub/apps/jobs/graphql.py - JobFaqQuestionType + query
- server/neuronhub/apps/jobs/migrations/0021..0023 - schema + data + MarkdownField
- server/neuronhub/apps/sites/admin.py - SortableAdminBase + JobFaqQuestionInline
- server/neuronhub/settings.py - added adminsortable2 to INSTALLED_APPS
- client/src/apps/jobs/faq/JobFaqPage.tsx - FE: GraphQL + Prose + markedConfigured
- client/e2e/tests/job-faq.spec.ts - e2e test (passing)
- docs/src/pages/usage/reference/database-tables/JobFaqQuestion.mdx
- server/neuronhub/apps/jobs/migrations/0009_historicaljob_description_job_description.py - emptied ops (was duplicate)
- packages/shared/src/components/ui/prose.tsx - Prose defaults that override FAQ styles

## Exec-Plan

<LLM_unverified_report>

### What was done

Backend fully complete:
- JobFaqQuestion model: question, answer_md (MarkdownField), order, site FK
- adminsortable2: SortableStackedInline on SiteConfig admin (SortableAdminBase)
- GraphQL: JobFaqQuestionType + job_faq_questions query (persisted)
- Data migration: 7 FAQ items from original JSX converted to markdown
- Migration creates SiteConfig via get_or_create() if missing
- Docs page at database-tables/JobFaqQuestion.mdx
- E2E test passing

### What needs fixing (CTO feedback)

1. Styles broken on `<Prose>`:
   - Original had `style.answer` (fontSize 13px, lineHeight 19px, color brand.black) applied to answer content, and `style.link` (color brand.green.light) on links.
   - Current `<Prose>` uses its own defaults (different font-size, line-height, link color fg.secondary).
   - Fix: pass `style.answer` as css prop to `<Prose>`, and override `& a` color to `brand.green.light` to match original.
   - Example: `<Prose css={{ ...style.answer, "& a": { color: "brand.green.light", fontWeight: "medium" } }}>`

2. Missing skeleton loading state:
   - Currently uses bare `<Spinner />` for loading.
   - Fix: replace with Chakra `<Skeleton>` placeholders matching accordion item shapes.
   - Example: render 4-5 skeleton accordion items with height matching real items.

### Pre-existing issues encountered

- Broken migration 0009_historicaljob_description (DuplicateColumn with 0014) - emptied operations.
- Pre-existing tsgo errors (pg-primary variant) and mypy (Gen.create missing arg) - not from this task.

</LLM_unverified_report>

## Decision-Log

- Issue: adminsortable2 ordering for FAQ inlines
    - Fix: SortableStackedInline + SortableAdminBase on SiteConfig
    - adminsortable2 was in pyproject.toml but not INSTALLED_APPS
- Issue: data migration skipped when no SiteConfig
    - Fix: get_or_create() instead of first()
- Issue: pre-existing 0009 migration DuplicateColumn
    - Fix: emptied ops (redundant w/ 0014)
    - Tradeoff: modifies old migration, safe since ops were duplicate
- Issue: Prose overrides style.answer + link colors
    - WIP: pass style.answer as css prop, override `& a`
- Issue: bare Spinner instead of skeleton loading
    - WIP: add Skeleton placeholders for accordion items
- Fix: CTO changed answer_md to MarkdownField (CodeMirror in admin)
