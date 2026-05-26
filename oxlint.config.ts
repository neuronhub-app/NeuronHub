import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "typescript", "oxc", "unicorn"],
  rules: {
    "typescript/no-explicit-any": "error",
    "typescript/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        minimumDescriptionLength: 1,
      },
    ],
    "no-param-reassign": "error",
    "react/self-closing-comp": "error", // `<div></div>` => `<div />`
    "no-unused-vars": "off", // used for in-code docs
    "react/exhaustive-deps": "off", // fails to define "exhaustive" useEffect deps
    "typescript/no-non-null-assertion": "off", //`!` for fail-fast
    "prefer-arrow-callback":"off"
  },
  ignorePatterns: [
    "client/node_modules",
    "docs/node_modules",
    "**/node_modules",
    "client/graphql", // gql.tada generated
     // chakra "Closed Components" trash:
    "client/src/components/ui/**",
    "packages/shared/src/ui/**",
    "client/src/apps/users/settings/profile/ThemeSelector.tsx",
  ],
  overrides: [
    {
      // Playwright `window` casts need `any`
      files: ["**/e2e/**"],
      rules: {
        "typescript/no-explicit-any": "off",
      },
    },
  ],
});
