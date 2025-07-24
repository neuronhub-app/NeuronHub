#!/usr/bin/env bun

import { writeFile } from "node:fs/promises";
import { Glob } from "bun";

async function buildMarkdownTemplates(): Promise<void> {
  const glob = new Glob("commands/templates/*.ts");

  for await (const file of glob.scan(".")) {
    const fileName = file.split("/").pop()!.replace(".ts", "");
    const module = await import(`./${file}`);

    const templateFunction = module[fileName];
    if (typeof templateFunction === "function") {
      await writeFile(`./commands/${fileName}.md`, templateFunction()); // /template/{name}.md will match `export function {name}`
    } else {
      console.error(`wrong ${fileName} fn export`);
    }
  }
}

await buildMarkdownTemplates();
