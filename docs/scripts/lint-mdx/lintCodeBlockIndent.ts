import { readFileSync } from "node:fs";
import path from "node:path";

import { pagesDir } from "~/scripts/lint-mdx/paths";

import { findMdxFiles } from "@/utils/findMdxFiles";

/**
 * `CodeBlockText` snippets must survive MDX's flow-expression dedent.
 * MDX (micromark, `indentSize=2`) strips up to 2 leading spaces from every
 * continuation line of a multiline `{`...`}` expression. So a snippet that mixes
 * col-0 lines with indented lines, or uses leading tabs / a single leading space,
 * renders with mangled indentation. Convention: indent every non-blank content
 * line by ≥2 spaces (no tabs); the eaten 2 yields the intended layout.
 */
export function lintCodeBlockIndent(): boolean {
  const errors: string[] = [];

  for (const file of findMdxFiles(pagesDir)) {
    const content = readFileSync(file, "utf-8");
    const relPath = path.relative(pagesDir, file);

    let match: RegExpExecArray | null;
    const codeBlock = /<CodeBlockText\b[^>]*>\{`([\s\S]*?)`\}/g;
    let blockIndex = 0;
    while ((match = codeBlock.exec(content)) !== null) {
      blockIndex++;
      const nonBlank = match[1].split("\n").filter(line => line.trim() !== "");
      const isColZero = nonBlank.some(line => !/^\s/.test(line));
      const isIndented = nonBlank.some(line => /^ {2,}/.test(line));
      const isTab = nonBlank.some(line => /^\t| \t/.test(line));
      const isOneSpace = nonBlank.some(line => /^ [^ ]/.test(line));

      if ((isColZero && isIndented) || isTab || isOneSpace) {
        errors.push(`  ${relPath}: CodeBlockText #${blockIndex}`);
      }
    }
  }

  if (errors.length === 0) {
    return false;
  }
  console.error(
    `CodeBlockText snippet breaks MDX's 2-space dedent (${errors.length}) ` +
      `— indent every non-blank line by ≥2 spaces, no tabs:\n${errors.join("\n")}`,
  );
  return true;
}
