/**
 * #AI
 */
// @ts-expect-error
const mdxModules = import.meta.glob("/src/pages/**/*.mdx", { eager: true }) as Record<
  string,
  { frontmatter?: { title?: string } }
>;

export const navGroups = buildNavGroups(mdxModules);

function buildNavGroups(
  modules: Record<string, { frontmatter?: { title?: string } }>,
): Array<NavGroup> {
  const groupsMap = new Map<string, Array<Page>>();

  for (const [filePath, module] of Object.entries(modules)) {
    const stripped = filePath.replace(/^.*\/pages\//, "").replace(".mdx", "");
    const parts = stripped.split("/");
    if (parts.length < 2) {
      continue;
    }
    const groupSlug = parts[parts.length - 2];
    const fileSlug = parts[parts.length - 1];
    const href = `/${stripped.toLowerCase()}`;

    const groupTitle = toTitleCase(groupSlug);
    const title = module.frontmatter?.title ?? toTitleCase(fileSlug);

    if (!groupsMap.has(groupTitle)) {
      groupsMap.set(groupTitle, []);
    }
    groupsMap.get(groupTitle)!.push({ title, href });
  }

  return Array.from(groupsMap.entries()).map(([title, items]) => ({
    title,
    items: items.sort((a, b) => a.title.localeCompare(b.title)),
  }));
}

function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

type Page = { title: string; href: string };
export type NavGroup = { title: string; items: Array<Page> };
