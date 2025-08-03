import { initGraphQLTada } from "gql.tada";
/**
 * According to the docs, this is supposed to be optional.
 * But types don't work without this file.
 *
 * This is a copy-paste of the default from the docs, with disableMasking=true.
 */
import type { introspection } from "~/graphql/gql-tada/graphql-env.d.ts";

export const graphql = initGraphQLTada<{
  // `disableMasking: false` is overengineered.
  // You know it's bad when docs have pages explaining "this abstraction is actually good for you"
  disableMasking: true;
  introspection: introspection;
  scalars: {
    DateTime: string;
    Decimal: string;
    Upload: File;
  };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";

export type ID = ReturnType<typeof graphql.scalar<"ID">>;
