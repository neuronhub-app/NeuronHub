/**
 * #AI
 */
// Vite build: runs before aliases - requires node:fs and relative imports (no @/, no Bun)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { type RouteConfig, layout, route } from "@react-router/dev/routes";
import { findMdxFiles } from "./utils/findMdxFiles";
import { frontmatter } from "./components/frontmatter";

const pagesDir = path.join(import.meta.dirname, "pages");

export default [
  layout("components/DocsLayout.tsx", [
    route("/", "pages/index.tsx"),
    // Split: mdx routes produce file routes, dir redirects produce loader-only routes
    ...buildMdxRoutes(),
    ...buildDirRedirects(),
  ]),
] satisfies RouteConfig;

function buildMdxRoutes() {
  return findMdxFiles(pagesDir).map(file => {
    return route(fileToSlug(file), path.relative(import.meta.dirname, file));
  });
}

function buildDirRedirects() {
  const routes: ReturnType<typeof route>[] = [];

  for (const dir of findDirsWithMdx(pagesDir)) {
    const slug = "/" + path.relative(pagesDir, dir).toLowerCase();
    const isHasReadme = existsSync(path.join(dir, `${frontmatter.consts.readme}.mdx`));

    const redirect = "dir-redirect.tsx";
    routes.push(route(slug, `pages/${redirect}`, { id: `redirect:${slug}` }));
    if (!isHasReadme) {
      routes.push(route(slug + "/", `pages/${redirect}`, { id: `redirect:${slug}/` }));
    }
  }

  return routes;
}

function fileToSlug(file: string): string {
  const rel = path.relative(pagesDir, file).replace(".mdx", "").toLowerCase();
  const dirPath = path.dirname(rel);
  const fm = frontmatter.parse(readFileSync(file, "utf-8"));

  if (fm.slug) {
    return `/${dirPath}/${fm.slug}`;
  }
  if (path.basename(rel) === frontmatter.consts.readme) {
    return `/${dirPath}/`;
  }
  return `/${rel}`;
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
