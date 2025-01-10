import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * The project relies on gql.tada instead of codegen.
 *
 * But some types are cleaner to extract with codegen,
 * than use gql.tada unwrappers.
 *
 * Also helps with Enum extraction.
 *
 * And can be useful to hardcode allowed queries/mutations.
 */
export default {
  schema: "../schema.graphql",
  documents: ["./src/**/*"],
  ignoreNoDocuments: true, // for better experience with the watcher

  generates: {
    "./graphql/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true,
      },
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["bun run format"],
  },
} as CodegenConfig;
