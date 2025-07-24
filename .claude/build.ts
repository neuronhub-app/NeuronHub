#!/usr/bin/env bun
/**
 * Builds commands using `commands/templates/{template}.md` from `commands/templates/components/*`
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const componentsDir = "./commands/templates/components";
const templatesDir = "./commands/templates";
const outputDir = "./commands";

const componentMap = new Map<string, string>();

async function loadComponents(dir: string, prefix = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      await loadComponents(path, join(prefix, entry.name));
    } else if (entry.name.endsWith(".md")) {
      const name = join(prefix, basename(entry.name, ".md"));
      componentMap.set(name, await readFile(path, "utf-8"));
    }
  }
}

await loadComponents(componentsDir);

for (const templateFile of await readdir(templatesDir)) {
  if (!templateFile.endsWith(".md")) continue;

  let content = await readFile(join(templatesDir, templateFile), "utf-8");

  content = content.replace(
    /!\[\]\(\.\/components\/(.+?)\.md\)/g,
    (match, componentPath) => componentMap.get(componentPath) ?? match,
  );

  await writeFile(join(outputDir, templateFile), content);
  console.log(`✓ ${templateFile}`);
}
