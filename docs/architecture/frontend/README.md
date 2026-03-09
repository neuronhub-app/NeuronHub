---
paths:
  - "**/*.tsx?"
---

## Structure

- `[[schema.graphql]]` - the single GraphQL schema from Strawberry

### `client/`
- [[routes.ts]] - has react-router `RouteConfig`, using `src/urls.ts` that has `export const urls = { ... }` (for use as `urls.reviews.list`).
- `src/apps/` - aims to mirror `server/neuronhub/apps/`
	- has specialized dirs to match the react-router urls structure, eg has both `/posts` and `reviews/`.
	- react-router v7 `export default` are in empty `index.tsx` files.
	- when a component or hook are used only by one page - it's placed in same dir as react-router `index.tsx`.
- `src/apps/highlighter` - badly written apps.highlighter UI logic
- `src/components/` - components shared between `src/apps/`
	- [[LayoutContainer.tsx]] (and [[LayoutSidebar.tsx]]) used in [[root.tsx]]
	- `forms/` - Chakra inputs adapted for react-hook-form.
	- `posts/` - shared code for all `Post` react-hook-forms.
	- `posts/form/*.tsx` - fields for use in `Post` forms.
	- `posts/form/[[schemas.ts]]` - all Zod `export namespace schemas` for `Post` react-hook-forms, and serializers + deserializers.
	- `ui/` - deprecated trash "Closed Components" forced by the old @chakra-ui. Do not use unless necessary. Most of them are replaceable with the new `@chakra-ui/react` exports.
- GraphQL
	- [[mutateAndRefetchMountedQueries.tsx]] - use it instead `client.mutate()`
	- [[useApolloQuery.ts]] - use instead of the broken `useQuery`, including its `isLoadingFirstTime` instead of `loading`
	- `src/graphql/[[client.ts]]` - Apollo `export const client` for when you need exceptions
	- `src/[[codegen.ts]]` - is only used for TS enums generation - all GraphQL types are handled by gql.tada.
- `src/components/algolia/` - see `Algolia.md` if needed
- `src/theme/` - @chakra-ui theme config and semantic tokens
- `src/[[env.ts]]` - typed `export const env`
- `e2e/` - Playwright with its `e2e/tests`

## gql.tada Persisted Queries

We save all `client/` queries to the whitelist at [[server/persisted-queries.json]] with gql.tada CLI (during `mise lint`) - Strawberry rejects all by default.

## Error handling

Note: `toast.error()` from [[client/src/utils/toast.tsx]] also calls `Sentry.captureException`.

## Code Conventions

- instead of `useState` use [[useStateValtio.ts]]. Unless there's a significant maintenance/performance benefit in the `useState`

## Constraints

- JS ecosystem is trash.
- Playwright adds extreme maintenance cost.
- GraphQL cache is unmaintainable - don't use it.
- React state management became legacy after the `Proxy` objects.
- React Router server API, Server Components, and SSR are bad, and aren't used.

## Mandatory task-specific docs

Must read when working with any of those module.

- [How to structure a React Component](./React-component-structure.md)
- [How to use GraphQL](./GraphQL.md)
- [How to use Playwright](./Playwright.md)
- [How to use Chakra UI](Chakra-UI.md)
- [How to work with sub-sites as `VITE_SITE="pg"`](Sub-sites-with-VITE_SITE.md) from `src/sites/`
