## Desc

Using Airtable API we've replaced `jobs/services/csv_import.py` with `airtable_sync_jobs.py`.
The API key is already set in this env. We're using `pyairtable`.

Focus on the last task.

Note:
- The logs were written by an LLM - hence untrusted.
- Airtable can supply broken data. It will be replaced with staff using Django later.
- Visa tags aren't used.
- Don't read `/tmp/airtable_review` or other issue files.

### Tasks

- [x] v1 migration to Airtable API
- [x] run `jobs_airtable_sync --limit` & review the dev db data with the Airtable data (you can grab it via a manage.py API query script).
- [x] meaningful-diff gate via `serialize_job_to_md` → drafts only
- [x] sync to clone published into `is_pending_removal=True` draft linked via `version_of`; same FE gate as changes. Approving the removal draft deletes both.
- [x] start fixing `publish_job_versions`.
    - [x] `UniqueConstraint(slug) WHERE is_published=True`
- [x] add `Job.is_duplicate_url_valid` based on `Duplicate URL` Airtable field.
    - ignore the rest of the duplicates that have older `posted_at` date than the latest Job version.
- [x] fix `publish_job_versions.py`
- [x] in `serialize_job_to_md` drop `JobLocation.country` if the Job already has `.city` with the same `.country` value.
	- otherwise the render looks like a duplicated location, because the `city` location already renders the `country` part.

## Relevant-Files

Airtable sync:
- server/neuronhub/apps/jobs/services/airtable_sync_jobs.py — `_sync_job_parsed` per-row draft flow; `_qs_prefetched`; md-diff delete; `_dedupe_by_url_keeping_latest_posted_at`
- server/neuronhub/apps/jobs/services/airtable_sync_jobs__test.py — noop / linked-draft / rerun-collapse / orphan / m2m-noop / query-cap / dup-urla
- server/neuronhub/apps/jobs/services/airtable_sync_orgs.py
- server/neuronhub/apps/jobs/services/airtable_sync_orgs__test.py
- server/neuronhub/apps/jobs/migrations/0054_historicaljob_is_duplicate_url_valid_and_more.py

Diff oracle + versions flow:
- server/neuronhub/apps/jobs/services/serialize_job_to_md.py
- server/neuronhub/apps/jobs/services/serialize_job_to_md__test.py — dedup country-city location rendering
- server/neuronhub/apps/jobs/graphql.py — `JobVersionType.published: JobType | None`; `_compose_job_version` uses `version_of` M2M; `job_versions_pending` surfaces orphans
- server/neuronhub/apps/jobs/services/publish_job_versions.py — split removal/update; iterate all peers
- server/neuronhub/apps/jobs/services/publish_job_versions__test.py — shared-slug + multi-peer tests
- server/neuronhub/apps/jobs/models.py — `Job.Meta.constraints` restored; `JobAlert.jobs_clicked` is ArrayField
- client/src/apps/jobs/versions/JobVersionReview.tsx — 3 `Collapsible` sections (New/Updated/Removed); `JobVersionAdminMenu` kebab; inline title with org icon+name+job title

Other (context):
- server/neuronhub/apps/jobs/tasks.py - added `airtable_sync_task`
- server/neuronhub/apps/jobs/migrations/0052_historicaljob_is_created_by_sync_and_more.py — `Job.is_created_by_sync` lets next sync update prev draft, not spawn new

## Decision-Log

- `cell_format='string'` resolves linked/lookups as old CSVs → parsers port 1:1
    - Requires `time_zone` + `user_locale`.
- Formats: Date Added `%B %d, %Y` (no time; prev version had `%I:%M%p`); Min Salary comma-grouped `48,656.00`.
- `source_ext` gated by `Job.SourceExt.values` & sentry exc
- Shared helpers `TagParams`/`_list_split_and_strip`/`_sync_tags` in `airtable_sync_jobs.py`; orgs imports.
- django-object-actions: `JobAdmin.changelist_actions=["airtable_sync"]`, non-superuser → 403.
- `airtable_sync_task` wraps Sentry `op="function"` + span `op="queue.process"`
- `airtable_sync_task` awaits orgs then jobs. No `async_to_sync`.
- `_sync_tags` `aget_or_create` scoped to `tag_parent=None`
    - PostTag `unique_together=(tag_parent, name)`; dup names eg "Animal Welfare" crashed `MultipleObjectsReturned`.
- Verification: DB-driven
    - `/tmp/dump_airtable_review.py` writes 30 (Airtable JSON, DB md) pairs via `serialize_job_to_md`.
    - 3 subagents audit chunks of 10.
- `_parse_location_field` uses `csv.reader(skipinitialspace=True)`
    - Airtable emits `", "` between quoted entries; default csv dropped entries past first. [to add to docs/src/pages/usage/reference/changelog.mdx]
- `limit` param removed for orgs
    - partial Orgs sync corrupts data.

#### code review
 
- RED tests added in airtable_sync_jobs__test.py (3 failing):
    - `_sync_tags` aadd leaks categories across syncs
        - Skill "Python" + Area resync → tag gains Area silently.
        - Pollutes `limit_choices_to` pickers.
        - `TestSyncTags.test_does_not_pollute_existing_tag_categories`
    - Orphan + published same URL spawns 2nd draft
        - `published.versions` M2M filter misses pre-existing orphan.
    - Visa tags on published force perpetual draft
        - Sync loop iterates VisaSponsorship; parser drops it → aset([]) → md always diverges.
- Used `gen.jobs.job()` and `gen.jobs.job_draft()`.

### diff review

- Diff gate via MD. Reviewer lens = single source of truth for "meaningful"; one place to grow.
- Orphan drafts for new URLs (`version_of` empty)
    - `JobVersionType.published` → optional; `job_versions_pending` + `_compose_job_version` widened.
- `_sync_job_parsed` writes drafts only; md-diff deletes draft if matches published
- `_compose_job_version` peer lookup: slug → `job_draft.version_of.filter(is_published=True).first()`

#### removal flow

- clone-as-draft
    - Unified review list; diff renders via existing `_compose_job_version`.
- URL reappearance: drop stale `is_pending_removal` draft at top of `_sync_job_parsed`
    - Single query per row, then change-flow proceeds untouched.
- FE suppresses diff body when `draft.is_pending_removal` (clone → identical md)
- `publish_job_versions`: `is_pending_removal` branch deletes both before `ids_approved`

#### prod-storm: Created label was draft-existence, not pub-existence

- Was: `_sync_job_draft` returned `is_created=True` when no draft existed -> any pub w/o draft + md diverges (storm trigger: posted_at day-shift) -> "Created".
- Fix: branch on `job_published is None` in `_sync_job_parsed`. Drop `is_created` bool from `_sync_job_draft`.
- `is_must_restore_job` walrus folded into caller's unconditional `pub.versions.aadd(job_draft)`. Same orphan-recovery (job_draft = pre-existing orphan when found); aadd idempotent. JobAlert.jobs_clicked is on pub PK, untouched by this path - click loss only happens in `publish_job_versions` (`job_old.adelete`), unchanged here.

#### posted_at +1d shift

- `_fetch_airtable_jobs` used `time_zone="UTC"`; legacy CSV used PT
    - PT-evening createdTime (past 17:00 PDT) -> UTC fmt next-day -> +1d vs pub -> fake "updated"
- Migration 0050 TruncDay redundant (`%Y-%m-%d` strips time). Trimmed to visa-tags only; renamed `0050_clear_visa_tags`. Was never in prod.

#### publish_job_versions

- Partial `UniqueConstraint(slug) WHERE is_published=True` (restores 0029 drop, as partial)
    - AutoSlugField's `find_unique` inspects `constraint.fields` only - ignores `condition` - so partial reads as plain slug-unique -> `-2` suffix on draft.
    - Fix: `_sync_job_draft` + `_create_job_draft_is_pending_removal` acreate-then-`asave()` to pin pub.slug post-regen. +2 queries/row -> assertNumQueries 31->33.
- Orphan slug collisions don't occur in prod: sync's `acreate` triggers AutoSlugField `find_unique` (reads partial as plain unique → `-2` suffix). Slug pinning only happens when pub peer exists. So bulk aupdate is safe.
- Multi-peer cleanup on removal: `Job.filter(versions__in=drafts, is_published=True).distinct()` - per #6.
- Other-drafts of same pub left as orphans on update (per #7); `version_of` clears via M2M cascade on pub delete.
- Test rewrite: dropped trash (`is_in_algolia_index`, slug-constraint tests). 7 tests cover update/removal/create incl multi-peer + mixed batch.

### jobs_clicked M2M→ArrayField(slug)

- Mig 0053: AddField `jobs_clicked_new` on JobAlert+HistoricalJobAlert, RunPython copy (M2M.values_list("slug"); HistoricalJobAlert_jobs_clicked grouped by history_id), RemoveField old M2M, DeleteModel `HistoricalJobAlert_jobs_clicked`, Rename.
    - Temp-name-then-rename: avoids same-name collision across types in one migration.
- history test needs `@override_settings(SIMPLE_HISTORY_ENABLED=True)` (NeuronTestCase disables globally).

### .is_duplicate_url_valid

- Approved dups sync with `Duplicate URL` True; unflagged mistakes collapsed via dedupe.
- Dedupe keyed by `url_external`; winner = latest `posted_at`; flag OR'd across group (reviewer approval is group-level, must survive onto kept row).
- Included in `serialize_job_to_md` → flag flip spawns review draft.
