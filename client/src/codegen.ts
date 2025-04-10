import * as fs from "node:fs";
import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * The project uses gql.tada instead of codegen.
 * But some types are require codegen, eg Enums.
 *
 * And can help with hardcoding allowed queries/mutations in the future.
 */
export default {
  schema: "../schema.graphql",
  documents: ["./src/**/*"],
  ignoreNoDocuments: true, // for better experience with the watcher

  generates: {
    "./graphql/": {
      preset: "client",
    },
  },
  hooks: {
    afterAllFileWrite: ["bun run format"],
    afterOneFileWrite: (file: string) => {
      const isRedundantFile =
        file.endsWith("fragment-masking.ts") ||
        file.endsWith("index.ts") ||
        file.endsWith("gql.ts");

      if (isRedundantFile) {
        // delete, we use gql.tada for it
        fs.unlinkSync(file);
      }
    },
  },
} as CodegenConfig;
