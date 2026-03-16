/**
 * #AI
 */
import { redirect } from "react-router";
import { type NavNode, navTree, findFirstChildHrefRecursively } from "@/components/buildNavTree";

export default function DirRedirect() {
  return null;
}

export function loader({ request }: { request: Request }) {
  const pathname = new URL(request.url).pathname.replace(/\/$/, "");
  const node = findNodeAtPath(navTree, pathname);

  if (node?.href) {
    return redirect(node.href);
  }
  if (node) {
    const target = findFirstChildHrefRecursively(node.children);
    if (target) {
      return redirect(target);
    }
  }

  throw new Response("Not Found", { status: 404 });
}

function findNodeAtPath(tree: NavNode[], pathname: string): NavNode | undefined {
  const slugs = pathname.split("/").filter(Boolean);
  let children = tree;
  let node: NavNode | undefined;

  for (const slug of slugs) {
    node = children.find(n => n.slug === slug);
    if (!node) {
      return undefined;
    }
    children = node.children;
  }

  return node;
}
