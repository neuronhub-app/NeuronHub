import path from "node:path";

// Shared dirs for the lint-mdx module — kept here so sibling linters import
// them without a cycle through `lint-mdx.ts` (which runs `main()` on load).
const lintMdxDir = import.meta.dirname;
export const docsDir = path.resolve(lintMdxDir, "../..");
export const repoRoot = path.resolve(lintMdxDir, "../../..");
export const pagesDir = path.join(docsDir, "src/pages");
export const outDir = path.join(docsDir, ".lint-mdx");
