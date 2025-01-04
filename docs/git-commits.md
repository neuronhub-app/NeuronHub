---
reviewed_at: 2025.01.01
---

## Scopes

### Type

Write before `:`

- feat
- fix - bug fixes or reverts
- refac - including cleanup
- ui - visual changes in client/
- build - dependencies in pyproject.toml, package.json; frontend compilation, etc
- ci - deployments and pipelines
- docs
- perf - performance
- style - code style and formatting
- test

### Scopes

Put in the brackets after Type, as `()`

- monitor - sentry, datadog, etc
- track - PostHog or other changes re analytics and activity tracking
- auth - apps.auth or frontend logic for it, hijacking, permissions, etc
- admin - django admin related
- graphql - related to strawberry structure and/or graphql types
- BE - backend
- FE - frontend
- tags - related to FE or BE tags implementation

Scopes for the `docs` type:
- refac
- glossary
- readme - either backend or frontend or root

### Examples

- perf(act): optimize Rule[reply] with prefetch_related(crm_actions) #1269
- perf(stats): disable household stats + refactor
- fix(act): dedup function on Actions with donor=None
- fix(act): Households in Plan/History by using the correct bulk SQL function #607

### Specs

For details see [conventionalcommits.org/v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
And [the Angular guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type) that
I consider a fine example of implementing types and scopes. 
