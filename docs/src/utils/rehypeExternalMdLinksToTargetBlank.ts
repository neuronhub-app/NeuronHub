import type { Element, Root } from "hast";

/**
 * #AI
 *
 * Adds external security attrs to all Markdown `[text](url)` links.
 * */
export function rehypeExternalMdLinksToTargetBlank() {
  return (tree: Root) => {
    modifyTreeRecursively(tree);
  };
}

function modifyTreeRecursively(node: Root | Element) {
  if ("tagName" in node && node.tagName === "a") {
    node.properties ??= {};
    node.properties.rel = "nofollow noopener noreferrer";
    node.properties.target = "_blank";
  }
  if (node.children) {
    for (const child of node.children) {
      if (child.type === "element") {
        modifyTreeRecursively(child);
      }
    }
  }
}
