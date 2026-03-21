/**
 * #AI
 *
 * # todo ? refac: #AI code
 *
 * Caveats:
 * - indexes only H1, H2, H3 (ok).
 * - excludes dir if README.mdx has `hidden: true` (bad idea).
 * - unable to read JSX components, CodeBlock or [[GuideCard.tsx]] (bad).
 *
 * Code issues:
 * - `slug` function is duplicated across many files - even in this file, eg fileToSlug + headingToAnchor.
 *   Move it to [[format.ts]]'s `slugToTitle`.
 * - likely duplicates [[lint-mdx.ts]] and [[docs/src/routes.ts]] - must use one place to find files & extract pages.
 * - objectID is a slug - must be eg `as const satisfies [[ReactRouterPath]]`.
 * - rename dir to either: /docs/devops/ or /docs/src/.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createProcessor } from "@mdx-js/mdx";
import { algoliasearch } from "algoliasearch";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { format } from "@neuronhub/shared/utils/format";
import { findMdxFiles } from "@/utils/findMdxFiles";
import { frontmatter } from "@/components/frontmatter";

const config = {
  pagesDir: path.join(import.meta.dirname, "../src/pages"),
  mdxProcessor: createProcessor({
    remarkPlugins: [remarkGfm, remarkFrontmatter],
  }),
  env: {
    appId: process.env.ALGOLIA_APPLICATION_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_DOCS,
  },
  jsx_nodes: {
    excluded: new Set([
      "code",
      "yaml",
      "toml",
      "table",
      "mdxjsEsm",
      "mdxFlowExpression",
      "mdxTextExpression",
    ]),
    need_newlines_appended: new Set(["root", "paragraph", "heading", "listItem", "blockquote"]),
  } as const,
};

await algoliaIndexDocs();

async function algoliaIndexDocs() {
  const records = buildRecords();
  console.log(`Built ${records.length} records from docs`);

  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify(records.slice(0, 3), null, 2));
    return;
  }

  if (!config.env.appId || !config.env.apiKey || !config.env.indexName) {
    throw new Error("Missing Algolia envs");
  }
  const client = algoliasearch(config.env.appId!, config.env.apiKey!);

  await client.setSettings({
    indexName: config.env.indexName!,
    indexSettings: {
      searchableAttributes: ["fileName", "pageTitle", "heading", "content"],
      attributesToSnippet: ["content:30"],
      attributesToHighlight: ["fileName", "pageTitle", "heading", "content"],
      camelCaseAttributes: ["fileName", "pageTitle", "heading", "content"],
      separatorsToIndex: "_",
      customRanking: ["asc(sectionIndex)"],
      attributeForDistinct: "pageSlug",
      distinct: true,
    },
  });

  await client.replaceAllObjects({ indexName: config.env.indexName!, objects: records });

  console.log(`Indexed ${records.length} records to "${config.env.indexName}"`);
}

function buildRecords(): DocRecord[] {
  const records: DocRecord[] = [];

  for (const file of findMdxFiles(config.pagesDir)) {
    const raw = readFileSync(file, "utf-8");
    const fm = frontmatter.parse(raw);

    if (fm.hidden || isHiddenByParent(file)) {
      continue;
    }

    const pageSlug = fileToSlug(file, fm);
    const fileName = path.basename(file, ".mdx");
    const isReadme = fileName.toLowerCase() === frontmatter.consts.readme.toLowerCase();
    const dirName = path.basename(path.dirname(file));
    const fileBaseName = isReadme ? dirName : fileName;
    const pageTitle = fm.title ?? format.slugToTitle(fileBaseName);
    const isNewBadge = fm.is_new ?? false;

    const sections = splitByHeadings(raw);
    const isHasIntro = sections.length > 0 && !sections[0].heading && sections[0].body;

    if (!isHasIntro) {
      records.push({
        objectID: `${pageSlug}__page`,
        fileName: fileBaseName,
        pageTitle,
        pageSlug,
        heading: pageTitle,
        headingPath: pageTitle,
        content: "",
        url: pageSlug,
        sectionIndex: -1,
        isNewBadge,
      });
    }

    for (let index = 0; index < sections.length; index++) {
      const section = sections[index];
      if (!section.body && !section.heading) {
        continue;
      }

      const anchor = section.heading ? `#${headingToAnchor(section.heading)}` : "";
      records.push({
        objectID: `${pageSlug}__${index}`,
        fileName: fileBaseName,
        pageTitle,
        pageSlug,
        heading: section.heading || pageTitle,
        headingPath: section.heading ? `${pageTitle} > ${section.heading}` : pageTitle,
        content: section.body,
        url: `${pageSlug}${anchor}`,
        sectionIndex: index,
        isNewBadge,
      });
    }
  }

  return records;
}

function fileToSlug(file: string, fm: frontmatter.SchemaType): string {
  const rel = path.relative(config.pagesDir, file).replace(".mdx", "").toLowerCase();
  const dirPath = path.dirname(rel);

  if (fm.slug) {
    return `/${dirPath}/${fm.slug}`;
  }
  if (path.basename(rel) === frontmatter.consts.readme.toLowerCase()) {
    return `/${dirPath}/`;
  }
  return `/${rel}`;
}

function splitByHeadings(raw: string): Array<{ heading: string; body: string }> {
  const tree = config.mdxProcessor.parse(raw);
  const sections: Array<{ heading: string; body: string }> = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth <= 3) {
      if (currentHeading || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = extractText(node as MdNode).trim();
      currentBody = [];
    } else {
      const text = extractText(node as MdNode).trim();
      if (text) {
        currentBody.push(text);
      }
    }
  }

  if (currentHeading || currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }

  return sections;
}

function isHiddenByParent(file: string): boolean {
  let dir = path.dirname(file);
  while (dir.startsWith(config.pagesDir) && dir !== config.pagesDir) {
    try {
      if (frontmatter.parseFile(path.join(dir, `${frontmatter.consts.readme}.mdx`)).hidden) {
        return true;
      }
    } catch {
      // no README.mdx
    }
    dir = path.dirname(dir);
  }
  return false;
}

function headingToAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractText(node: MdNode): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? "";
  }
  if (config.jsx_nodes.excluded.has(node.type)) {
    return "";
  }
  if (node.children?.length) {
    const text = node.children.map(extractText).join("");
    return config.jsx_nodes.need_newlines_appended.has(node.type) ? `${text}\n` : text;
  }
  // Self-closing JSX (eg <PageLink id="SiteConfig" />) => use `id` prop as text
  if (node.attributes?.length) {
    const id = node.attributes.find(a => a.name === "id");
    if (id?.value) {
      return String(id.value);
    }
  }
  return "";
}

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MdNode[];
  attributes?: Array<{ name: string; value?: string | boolean | null }>;
};

type DocRecord = {
  objectID: string;
  fileName: string;
  pageTitle: string;
  pageSlug: string;
  heading: string;
  headingPath: string;
  content: string;
  url: string;
  sectionIndex: number;
  isNewBadge: boolean;
};
