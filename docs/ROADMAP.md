## Project status and next steps

*In parentheses are the [Scopes](/docs/git-commits.md#scopes)*

### v0.1.0.0

- [x] feat(post-form): add `review_rating` `review_importance`
- [x] (API): switch to Apollo to refetch after every mutation
- [x] feat(comment): editing
- [x] (post-form):
  - [x] refac: split Review's on sub field sets, add Zod `schemas.ts`
  - [x] feat: Tool creation
  - [x] feat: Review deletion
  - [ ] feat: add `Post.review_tags` and `Post.tags` for Review
  - [ ] feat: Tool list
  - [ ] feat: Post create/edit

#### Deploy
- [ ] Git repo
- [ ] Dokploy

### v0.2.0.0

- [ ] build(monitor): Sentry
- [ ] feat(post-form): logo upload
- [ ] feat(post-form): `alternative` votes and comments
- [ ] feat(post-form): Review `tool` AsyncSelect
- [ ] feat(post-form): Experience
- [ ] feat(auth): avatar upload
- [ ] feat(auth): /review `visibility`
- [ ] feat(API): paginate

### v0.2.1.0

- [ ] feat(auth): signup
- [ ] feat(auth): aliases select
- [ ] feat(post-form): pros/cons list indicator with icons
- [ ] feat(comment): vote `changed my mind`

### v0.3.0.0

- [ ] (auth) Apple/Google
