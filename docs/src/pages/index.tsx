import { redirect } from "react-router";

export function loader() {
  return redirect("/usage/guides/overview");
}

export default function DocsIndex() {
  return null;
}
