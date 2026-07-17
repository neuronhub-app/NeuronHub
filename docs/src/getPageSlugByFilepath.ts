/**
 * #AI
 */
import { readFileSync } from "node:fs";
import path from "node:path";

// Vite build is before TS aliases - needs rel imports.
import { frontmatter } from "./components/frontmatter";

export const pagesDir = path.join(import.meta.dirname, "pages");

export function getPageSlugByFilepath(file: string): string {
  const rel = path.relative(pagesDir, file).replace(".mdx", "").toLowerCase();
  const dirPath = path.dirname(rel);
  const fm = frontmatter.parse(readFileSync(file, "utf-8"));

  if (fm.slug) {
    return `/${dirPath}/${fm.slug}`;
  }
  // Compare the original-case basename - `rel` is lowercased.
  if (path.basename(file, ".mdx") === frontmatter.consts.readme) {
    return `/${dirPath}`;
  }
  return `/${rel}`;
}
