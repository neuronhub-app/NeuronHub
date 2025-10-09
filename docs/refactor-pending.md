- rename `server` to `backend`, and `client` to `frontend`
- rename GraphQL mutations to `{noun}_{verb}`
- shorten Post subset names as `PostTool`/`PostReview` to `Tool`/`Review`

### Client

- restructure `client/src` per #59
- replace `.toHaveText(CreateForm.strs)` with a `testid` for a *success* msg. Add `helper.submit(ids.post)`
- merge detail pages logic of `apps/<type>/edit/index.tsx`
- prefix `components/posts/PostCard/*` components with `PostCard*` - to show they're not react-hook-from, but for render-only
