## Structure

- `schema.graphql` - the single GraphQL schema from Strawberry

### `client/`
- `src/routes.ts` - has react-router `RouteConfig`, using `src/urls.ts` that has `export const urls = { ... }` (for use as `urls.reviews.list`).
- `src/apps/` - aims to mirror `server/neuronhub/apps/`
	- has specialized dirs to match the react-router urls structure, eg has both `/posts` and `reviews/`.
	- react-router v7 `export default` are in empty `index.tsx` files.
	- when a component or hook are used only by one page - it's placed in same dir as react-router `index.tsx`.
- `src/apps/highlighter` - badly written apps.highlighter UI logic
- `src/components/` - components shared between `src/apps/`
	- `forms/` - Chakra inputs adapted for react-hook-form.
	- `posts/` - shared code for all `Post` react-hook-forms.
	- `posts/form/*.tsx` - fields for use in `Post` forms.
	- `posts/form/schemas.ts` - all Zod `export namespace schemas` for `Post` react-hook-forms, and serializers + deserializers.
	- `ui/` - deprecated bad "Closed Components" forced by the old @chakra-ui. We're replacing them with `@chakra-ui/react` imports.
	- `layout/` - react-router layouts.
- GraphQL
	- `src/graphql/mutateAndRefetchMountedQueries.ts` - use it instead `client.mutate()`
	- `src/graphql/useApolloQuery.ts` - use instead broken `useQuery`, including its `isLoadingFirstTime` instead of `loading`
	- `src/graphql/client.ts` - Apollo `export const client`
	- `src/codegen.ts` - is only used for TS enums generation - for GraphQL types we use gql.tada.
- `src/theme/` - @chakra-ui theme config and semantic tokens
- `src/env.ts` - typed `export const env`
- `e2e/` - Playwright with its `e2e/tests`

## gql.tada Persisted Queries

We save all `client/` queries to the whitelist at `server/persisted-queries.json` with gql.tada CLI (during `mise lint`) - Strawberry rejects all by default.

## Constraints

- JS ecosystem is shit.
- Playwright adds extreme maintenance cost.
- GraphQL cache is unmaintainable - don't use it.
- React state management became legacy after the `Proxy` objects.
- React Router server API and SSR suck and aren't used.

## Mandatory task-specific docs

- [How to use GraphQL](./GraphQL.md)
- [How to structure a React Component](./React-component-structure.md)
- [How to use Playwright](./Playwright.md)
- [How to use Chakra UI](./Chakra-UI.md)
