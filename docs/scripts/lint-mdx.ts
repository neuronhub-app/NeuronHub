/**
 * #AI
 *
 * Lints MDX  files, eg <LinkInt path> props with react-router's typegen
 * (statically union of allowed page urls from docs/.react-router/**).
 *
 * Called by `mise lint`.
 */
import { compile } from "@mdx-js/mdx";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { findMdxFiles } from "@/utils/findMdxFiles";

const docsDir = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(docsDir, "src/pages");
const outDir = path.join(docsDir, ".lint-mdx");

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

  const tsconfig = {
    extends: "../tsconfig.json",
    compilerOptions: {
      noImplicitAny: false,
      rootDirs: ["..", "../.react-router/types", "."],
      paths: readParentPaths(),
    },
    include: ["./**/*.tsx", "../src/types.d.ts", "../.react-router/types", "../.chakra/types"],
  };

  writeFileSync(path.join(outDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  try {
    execSync("bun run tsgo --noEmit --project .lint-mdx/tsconfig.json", {
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
