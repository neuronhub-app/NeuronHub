import { format } from "@neuronhub/shared/utils/format";
import { frontmatter } from "@/components/frontmatter";

const mdxModules = import.meta.glob("/src/pages/**/*.mdx", { eager: true }) as Record<
  string,
  { frontmatter?: frontmatter.SchemaType }
>;

export const navTree = buildNavTree();

// #AI
function buildNavTree(): NavNode[] {
  const navNodes: NavNode[] = [];

  const dirsHidden = new Set<string>();
  for (const [filePath, module] of Object.entries(mdxModules)) {
    const file = parseFilePath(filePath, module.frontmatter);
    if (file.isReadme && file.frontmatter.hidden) {
      dirsHidden.add(file.dir.pathParts.join("/"));
    }
  }

  for (const [filePath, module] of Object.entries(mdxModules)) {
    const file = parseFilePath(filePath, module.frontmatter);

    if (file.frontmatter.hidden) {
      continue;
    }
    if (dirsHidden.has(file.dir.pathParts.join("/"))) {
      continue;
    }

    if (file.isReadme) {
      const parent = getOrCreateDirNode({ navNodes, pathParts: file.dir.pathParts });
      parent.href = file.href;
      if (file.frontmatter.title) {
        parent.title = file.title;
      }
      if (file.frontmatter.order !== undefined) {
        parent.order = file.order;
      }
    } else {
      const parent =
        file.dir.pathParts.length > 0
          ? getOrCreateDirNode({ navNodes, pathParts: file.dir.pathParts })
          : undefined;
      const leaf: NavNode = {
        slug: file.name.toLowerCase(),
        title: file.title,
        href: file.href,
        order: file.order,
        children: [],
      };
      if (parent) {
        parent.children.push(leaf);
      } else {
        navNodes.push(leaf);
      }
    }
  }

  sortByOrderOrTitleRecursively(navNodes);
  return navNodes;
}

export type NavNode = {
  slug: string;
  title: string;
  href?: string;
  order: number;
  children: NavNode[];
};

export function findFirstChildHrefRecursively(nodes: NavNode[]): string | undefined {
  for (const node of nodes) {
    if (node.href) {
      return node.href;
    }
    const childHref = findFirstChildHrefRecursively(node.children);
    if (childHref) {
      return childHref;
    }
  }
  return undefined;
}

function parseFilePath(filePath: string, frontmatterRaw?: frontmatter.SchemaType) {
  const pathStripped = filePath.replace(/^.*\/pages\//, "").replace(".mdx", "");
  const pathParts = pathStripped.split("/");
  const pathDirParts = pathParts.slice(0, -1);
  const dir = {
    pathParts: pathDirParts,
    name: pathDirParts.at(-1) ?? "",
    slug: pathDirParts.join("/").toLowerCase(),
  };

  const fileName = pathParts[pathParts.length - 1];
  const isReadme = fileName === frontmatter.consts.readme;
  const frontmttr = frontmatter.schema.parse(frontmatterRaw ?? {});
  return {
    frontmatter: frontmttr,
    name: fileName,
    isReadme,
    dir,
    title: frontmttr.title ?? format.slugToTitle(isReadme ? dir.name : fileName),
    order: frontmttr.order ?? Infinity,
    href: frontmttr.slug
      ? `/${dir.slug}/${frontmttr.slug}`
      : isReadme
        ? `/${dir.slug}/`
        : `/${pathStripped.toLowerCase()}`,
  };
}

// #AI
function getOrCreateDirNode(args: { navNodes: NavNode[]; pathParts: string[] }): NavNode {
  let nodes = args.navNodes;
  let node: NavNode | undefined;

  for (const pathPart of args.pathParts) {
    const slug = pathPart.toLowerCase();
    node = nodes.find(node => node.slug === slug);
    if (!node) {
      const nodeNew = {
        slug,
        title: format.slugToTitle(pathPart),
        order: Infinity,
        children: [],
      };
      nodes.push(nodeNew);
      node = nodeNew;
    }
    nodes = node.children;
  }

  return node!;
}

function sortByOrderOrTitleRecursively(nodes: NavNode[]) {
  nodes.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });
  for (const node of nodes) {
    sortByOrderOrTitleRecursively(node.children);
  }
}
