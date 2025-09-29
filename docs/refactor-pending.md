- restructure `client/src` per #59
- replace `.toHaveText(CreateForm.strs)` with a `testid` for a *success* msg. Add `helper.submit(ids.post)`
- rename GraphQL mutations to `{noun}_{verb}`
- rename `server` to `backend`, and `client` to `frontend`
- shorten Post subset names as `PostTool`/`PostReview` to `Tool`/`Review`

### E2E tests

- rename `helper` to `play`?
