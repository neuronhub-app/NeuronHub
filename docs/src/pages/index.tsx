import { redirect } from "react-router";

export function clientLoader() {
  return redirect("/usage/guides/overview");
}

export default function DocsIndex() {
  return null;
}
