---
paths: **/profiles/**/*.py
---

## Profiles App

Professional profiles directory with LLM-powered matching by a 3-step LLM flow.

### Models

For the UML overview of `profiles.models` see [arch/backend](/docs/architecture/README.md)

Models fields:
```
Profile
├── first_name, last_name, company, job_title, career_stage
├── biography, seeks, offers
├── tags: skills, interests
├── visibility: same system as posts.Post (PRIVATE → PUBLIC)
├── profile_for_llm_md: auto-serialized on save() via serialize_to_md(). And allows User to overwrite it.
├── match_hash: SHA256 of bio+skills+interests+seeks+offers
└── history

ProfileMatch
├── match_score_by_llm: 0-100
├── match_reason_by_llm: str
├── match_batch_id
├── match_processed_at
├── history
│
│review from User:
├── match_score: 0-100 
└── match_review
```

`Profile.match_hash` to detect changes — if differs from `Profile.compute_content_hash()` -> needs LLM reprocessing.

### LLM Matching Flow

#### Step 1: Cheap LLM Scoring (eg Haiku) — `score_matches_by_llm.py`

- To stop context rot splits unscored Profiles into batches (10 by default).
- Prompt = `User.profile_for_llm_md` + `<Calibration_Examples>` (from step 2) + `<Profile_List>` (serialized batch).
- Saves to `ProfileMatch.match_score_by_llm` + `.match_reason_by_llm`.

#### Step 2: Review & calibration by User — `summarize_match_reviews.py`

User corrects LLM scores in FE `ProfileMatch.match_score` + `.match_review`.

#### Step 3: Expensive LLM re-scoring (eg Sonnet) — `score_matches_by_llm.py`

Re-runs Step 1 with calibration from Step 2. `build_calibration_examples(max=8)`: sorted by `score_delta`, injects ~6 negative + ~2 positive corrections into the prompt.

#### Serialization — `serialize_to_md.py`

`Profile.save()` auto-populates `profile_for_llm_md`. Format:
```xml
<Profile id="123" name="Jane Doe">
	Job title: ML Engineer
	Skills: Python; PyTorch
	<bio>...</bio>
	<seeks>...</seeks>
	<offers>...</offers>
</Profile>
```

### Visibility & Algolia

Mirrors [[filter_posts_by_user.py]]. Algolia index uses `Profile.get_visible_to()` for token-restricted search (same as Posts: per-User).
