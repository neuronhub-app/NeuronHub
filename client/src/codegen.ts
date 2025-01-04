import type { CodegenConfig } from "@graphql-codegen/cli";

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
