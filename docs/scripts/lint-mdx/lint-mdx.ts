/**
 * #AI #quality-5%
 *
 * Lints MDX files.
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
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

import {
  lintLinkIntHashes,
  lintLinkIntPaths,
  lintSrcLinks,
  lintSrcToKeys,
} from "~/scripts/lint-mdx/linkLinks";
import { lintCodeBlockIndent } from "~/scripts/lint-mdx/lintCodeBlockIndent";
import { docsDir, outDir, pagesDir } from "~/scripts/lint-mdx/paths";

import { frontmatter } from "@/components/frontmatter";
import { findMdxFiles } from "@/utils/findMdxFiles";

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
  isCompileError = lintCodeBlockIndent() || isCompileError;

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
