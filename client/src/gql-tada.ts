import { initGraphQLTada } from "gql.tada";
/**
 * According to the docs, this is supposed to be optional.
 * But types don't work without this file.
 *
 * This is a copy-paste of the default from the docs, with disableMasking=true.
 */
import type { Scalars } from "~/graphql/graphql";
import type { introspection } from "~/graphql/graphql-env.d.ts";

export const graphql = initGraphQLTada<{
  // Re fragment unmasking: overengineered.
  // It's bad when paragraphs are written saying "this abstraction is actually good for you"
  disableMasking: true;
  introspection: introspection;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";

export type ID = Scalars["ID"]["input"];
