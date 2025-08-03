import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * While we use gql.tada instead of codegen, gql.data lacks Enum generation, hence we use codegen.
 */
export default {
  schema: "../schema.graphql",
  documents: [],
  ignoreNoDocuments: true,
  generates: {
    "./graphql/enums.ts": {
      plugins: [
        {
          typescript: {
            enumsAsTypes: false,
            onlyEnums: true,
          },
        },
      ],
    },
  },
} satisfies CodegenConfig;
