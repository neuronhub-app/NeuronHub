import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * We only use gql.tada, not codegen - but gql.data lacks Enum gen
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
