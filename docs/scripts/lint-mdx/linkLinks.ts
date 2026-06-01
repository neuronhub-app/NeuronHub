import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";

import { pagesDir, repoRoot } from "~/scripts/lint-mdx/paths";

import { links, paths } from "@/components/Src";
import { findMdxFiles } from "@/utils/findMdxFiles";

const llmSpecLogsDir = path.join(pagesDir, "development/reference/LLM-spec-logs");

// Verifies every `Src` `to`-shorthand maps to a file that exists in the local repo.
export function lintSrcLinks(): boolean {
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

// Every <LinkInt path="..."> in served MDX must resolve to a real page slug.
export function lintLinkIntPaths(validSlugs: Set<string>): boolean {
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

// Every <Src to="..."> key must exist in the links registry.
export function lintSrcToKeys(): boolean {
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

// Every <LinkInt path="P" ... hash="H"> in served MDX must point to a real heading anchor on page P.
export function lintLinkIntHashes(slugToFile: Map<string, string>): boolean {
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
