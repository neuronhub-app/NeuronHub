- rename `server` to `backend`, and `client` to `frontend`
- rename GraphQL mutations to `{noun}_{verb}`
- shorten Post subset names as `PostTool`/`PostReview` to `Tool`/`Review`

### Client

- restructure `client/src` per #59
- merge detail pages logic of `apps/<type>/edit/index.tsx`
- use `index.tsx` files only for `export` -> name the main files same as comp, eg `PostCard.tsx`
- prefix `components/posts/PostCard/*` components with `PostCard*` - to show they're not react-hook-from, but for render-only
