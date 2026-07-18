/**
 * #AI
 */
// Vite build: runs before aliases - requires node:fs and relative imports (no @/)
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { type RouteConfig, layout, route } from "@react-router/dev/routes";

import { frontmatter } from "./components/frontmatter";
import { getPageSlugByFilepath, pagesDir } from "./getPageSlugByFilepath";
import { findMdxFiles } from "./utils/findMdxFiles";

export default [
  layout("layout/DocsLayout.tsx", [
    route("/", "pages/index.tsx"),
    // Split: mdx routes produce file routes, dir redirects produce loader-only routes
    ...buildMdxRoutes(),
    ...buildDirRedirects(),
  ]),
] satisfies RouteConfig;

function buildMdxRoutes() {
  return findMdxFiles(pagesDir).map(file => {
    return route(getPageSlugByFilepath(file), path.relative(import.meta.dirname, file));
  });
}

function buildDirRedirects() {
  const routes: ReturnType<typeof route>[] = [];

  for (const dir of findDirsWithMdx(pagesDir)) {
    const slug = "/" + path.relative(pagesDir, dir).toLowerCase();
    const isHasReadme = existsSync(path.join(dir, `${frontmatter.consts.readme}.mdx`));

    // A README dir already has a content route at `slug` (see [[getPageSlugByFilepath.ts]]), so a
    // dir-redirect here would shadow it and loop back to itself.
    if (isHasReadme) {
      continue;
    }

    const redirect = "dir-redirect.tsx";
    routes.push(route(slug, `pages/${redirect}`, { id: `redirect:${slug}` }));
    routes.push(route(slug + "/", `pages/${redirect}`, { id: `redirect:${slug}/` }));
  }

  return routes;
}

function findDirsWithMdx(root: string): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(root)) {
    const full = path.join(root, entry);
    if (!statSync(full).isDirectory()) {
      continue;
    }
    if (findMdxFiles(full).length > 0) {
      results.push(full);
    }
    results.push(...findDirsWithMdx(full));
  }

  return results;
}
