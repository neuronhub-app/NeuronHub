import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 97,
  arrowParens: "avoid",

  // copy-paste from docs:
  sortImports: {
    "customGroups": [
      {
        "groupName": "generated",
        "elementNamePattern": ["~/**"],
      },
      {
        "groupName": "shared",
        "elementNamePattern": ["@neuronhub/**"],
      },
    ],
    // groups: [
    //   "type-import",
    //   ["value-builtin", "value-external"],
    //   "type-internal",
    //   "value-internal",
    //   ["type-parent", "type-sibling", "type-index"],
    //   ["value-parent", "value-sibling", "value-index"],
    //   "unknown",
    // ],
    groups: [
      "builtin",
      "external",
      ["generated", "shared"],
      ["internal", "subpath"],
      ["parent", "sibling", "index"],
      "style",
      "unknown",
    ],
  },

  ignorePatterns: [
    // fuck ups `<CodeBlockText>{`…`}` JSX tmpl literals
    "**/*.md",
    "**/*.mdx",
    // generated
    "client/graphql",
    "client/src/components/ui/**",
    "packages/shared/src/ui/**",
    "client/src/apps/users/settings/profile/ThemeSelector.tsx",
  ],

  sortPackageJson: false,
});
