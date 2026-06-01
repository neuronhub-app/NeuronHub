/**
 * #AI
 *
 * Lints MDX files, eg <LinkInt path> props with react-router's typegen
 * (statically union of allowed page urls from docs/.react-router/**).
 *
 * Called by `mise lint`.
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { compile } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

import { frontmatter } from "@/components/frontmatter";
import { links, paths } from "@/components/Src";
import { findMdxFiles } from "@/utils/findMdxFiles";

const docsDir = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(import.meta.dirname, "../..");
const pagesDir = path.join(docsDir, "src/pages");
const outDir = path.join(docsDir, ".lint-mdx");

// Verifies every `Src` `to`-shorthand maps to a file that exists in the local repo.
function lintSrcLinks(): boolean {
  const missing: string[] = [];
  for (const [key, url] of Object.entries(links)) {
    const relPath = url.replace(`${paths.github}/`, "");
    if (!existsSync(path.join(repoRoot, relPath))) {
      missing.push(`  ${key} → ${relPath}`);
    }
  }

  if (missing.length === 0) {
    return false;
  }
  console.error(
    `Src registry points to ${missing.length} missing repo file(s):\n${missing.join("\n")}`,
  );
  return true;
}

// The served slug of an MDX file — mirrors routes.ts logic.
function fileToSlug(file: string): string {
  const rel = path.relative(pagesDir, file).replace(".mdx", "").toLowerCase();
  const dirPath = path.dirname(rel);
  const fm = frontmatter.parse(readFileSync(file, "utf-8"));

  const slug = fm.slug
    ? `/${dirPath}/${fm.slug}`
    : path.basename(file, ".mdx") === frontmatter.consts.readme
      ? `/${dirPath}`
      : `/${rel}`;
  return slug.toLowerCase();
}

// Maps every served page slug to its source MDX file.
function buildSlugToFile(): Map<string, string> {
  const slugToFile = new Map<string, string>();
  for (const file of findMdxFiles(pagesDir)) {
    slugToFile.set(fileToSlug(file), file);
  }
  return slugToFile;
}

// Builds the set of served page slugs from MDX files + dir-redirect routes — mirrors routes.ts logic.
function buildServedSlugs(): Set<string> {
  const slugs = new Set<string>(buildSlugToFile().keys());

  // Add dir-redirect slugs (dirs without README, like /development/intro).
  for (const dir of findDirsWithMdx(pagesDir)) {
    const slug = "/" + path.relative(pagesDir, dir).toLowerCase();
    const isHasReadme = existsSync(path.join(dir, `${frontmatter.consts.readme}.mdx`));
    if (!isHasReadme) {
      slugs.add(slug);
    }
  }

  return slugs;
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

const llmSpecLogsDir = path.join(pagesDir, "development/reference/LLM-spec-logs");

// (a) Every <LinkInt path="..."> in served MDX must resolve to a real page slug.
function lintLinkIntPaths(validSlugs: Set<string>): boolean {
  const errors: string[] = [];

  for (const file of findMdxFiles(pagesDir)) {
    if (file.startsWith(llmSpecLogsDir)) {
      continue;
    }
    const content = readFileSync(file, "utf-8");
    const relPath = path.relative(pagesDir, file);

    for (const match of content.matchAll(/LinkInt\s+path="([^"]+)"/g)) {
      const linkPath = match[1].toLowerCase();
      if (!validSlugs.has(linkPath)) {
        errors.push(`  ${relPath}: path="${match[1]}"`);
      }
    }
  }

  if (errors.length === 0) {
    return false;
  }
  console.error(`LinkInt path resolves to no page (${errors.length}):\n${errors.join("\n")}`);
  return true;
}

// (b) Every <Src to="..."> key must exist in the links registry.
function lintSrcToKeys(): boolean {
  const errors: string[] = [];
  const registryKeys = new Set(Object.keys(links));

  for (const file of findMdxFiles(pagesDir)) {
    if (file.startsWith(llmSpecLogsDir)) {
      continue;
    }
    const content = readFileSync(file, "utf-8");
    const relPath = path.relative(pagesDir, file);

    for (const match of content.matchAll(/Src\s+to="([^"]+)"/g)) {
      const key = match[1];
      if (!registryKeys.has(key)) {
        errors.push(`  ${relPath}: to="${key}"`);
      }
    }
  }

  if (errors.length === 0) {
    return false;
  }
  console.error(`Src to= key missing from registry (${errors.length}):\n${errors.join("\n")}`);
  return true;
}

// Heading anchors of an MDX file, slugged the same way the rendered site does (rehype-slug → github-slugger).
function fileToAnchors(file: string): Set<string> {
  const slugger = new GithubSlugger();
  const anchors = new Set<string>();

  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const match = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (!match) {
      continue;
    }
    let text = match[1];

    // Explicit id `{#my-id}` wins over the slugged text.
    const explicit = text.match(/\{#([^}]+)\}\s*$/);
    if (explicit) {
      anchors.add(explicit[1]);
      continue;
    }

    // Strip inline markdown/JSX (`code`, **bold**, [links](url), <Tag>) before slugging.
    text = text
      .replace(/<[^>]+>/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_~]/g, "");
    anchors.add(slugger.slug(text));
  }

  return anchors;
}

// (c) Every <LinkInt path="P" ... hash="H"> in served MDX must point to a real heading anchor on page P.
function lintLinkIntHashes(slugToFile: Map<string, string>): boolean {
  const errors: string[] = [];
  const anchorsByFile = new Map<string, Set<string>>();

  for (const file of findMdxFiles(pagesDir)) {
    if (file.startsWith(llmSpecLogsDir)) {
      continue;
    }
    const content = readFileSync(file, "utf-8");
    const relPath = path.relative(pagesDir, file);

    for (const match of content.matchAll(/LinkInt\s+path="([^"]+)"[^>]*?\shash="([^"]+)"/g)) {
      const linkPath = match[1].toLowerCase();
      const hash = match[2];
      const targetFile = slugToFile.get(linkPath);
      if (!targetFile) {
        continue; // Unresolved paths are reported by lintLinkIntPaths.
      }

      let anchors = anchorsByFile.get(targetFile);
      if (!anchors) {
        anchors = fileToAnchors(targetFile);
        anchorsByFile.set(targetFile, anchors);
      }
      if (!anchors.has(hash)) {
        errors.push(`  ${relPath}: path="${match[1]}" hash="${hash}"`);
      }
    }
  }

  if (errors.length === 0) {
    return false;
  }
  console.error(`LinkInt hash resolves to no heading (${errors.length}):\n${errors.join("\n")}`);
  return true;
}

function readParentPaths(): Record<string, string[]> {
  const jsonc = readFileSync(path.join(docsDir, "tsconfig.json"), "utf-8");
  // Strip comments and trailing commas (JSONC)
  const json = jsonc.replace(/\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1");
  const raw = JSON.parse(json);
  const parentPaths: Record<string, string[]> = raw.compilerOptions?.paths ?? {};

  // Rewrite paths relative to .lint-mdx/ (one level deeper)
  const adjusted: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(parentPaths)) {
    adjusted[key] = values.map(v => `../${v}`);
  }
  return adjusted;
}

async function compileMdxFiles() {
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true });
  }
  mkdirSync(outDir, { recursive: true });

  let isCompileError = false;

  for (const file of findMdxFiles(pagesDir)) {
    const relPath = path.relative(pagesDir, file);
    const content = readFileSync(file, "utf-8");

    if (frontmatter.parse(content).is_lintable === false) {
      continue;
    }

    try {
      const compiled = await compile(content, {
        jsx: true,
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      });

      // Drop MDX boilerplate that causes noise errors:
      // - /*@jsxImportSource react*/ causes TS2875 (react/jsx-runtime not found)
      // - `(props)` untyped causes TS2339 (props.components on {})
      const code = String(compiled)
        .replace(/\/\*@jsxRuntime automatic\*\/\n?/, "")
        .replace(/\/\*@jsxImportSource react\*\/\n?/, "")
        .replace(/function _createMdxContent\(props\)/, "function _createMdxContent(props: any)")
        .replace(
          /export default function MDXContent\(props = \{\}\)/,
          "export default function MDXContent(props: any = {})",
        );

      const outFile = path.join(outDir, relPath.replace(/\.mdx$/, ".tsx"));
      mkdirSync(path.dirname(outFile), { recursive: true });
      writeFileSync(outFile, code);
    } catch (e) {
      console.error(`Failed to compile ${relPath}:`, e);
      isCompileError = true;
    }
  }

  return isCompileError;
}

async function main() {
  let isCompileError = await compileMdxFiles();
  isCompileError = lintSrcLinks() || isCompileError;

  const slugToFile = buildSlugToFile();
  isCompileError = lintLinkIntPaths(buildServedSlugs()) || isCompileError;
  isCompileError = lintSrcToKeys() || isCompileError;
  isCompileError = lintLinkIntHashes(slugToFile) || isCompileError;

  const tsconfig = {
    extends: "../tsconfig.json",
    compilerOptions: {
      types: ["node"],
      noImplicitAny: false,
      rootDirs: ["..", "../.react-router/types", "."],
      paths: readParentPaths(),
    },
    include: ["./**/*.tsx", "../src/types.d.ts", "../.react-router/types"],
  };

  writeFileSync(path.join(outDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  try {
    execSync("pnpm exec tsgo --noEmit --project .lint-mdx/tsconfig.json", {
      cwd: docsDir,
      stdio: "inherit",
    });
  } catch {
    isCompileError = true;
  }

  rmSync(outDir, { recursive: true });

  if (isCompileError) {
    process.exit(1);
  }
}

await main();
