import { pageLinks } from "@/components/buildNavTree";
import { LinkInt } from "@/components/LinkInt";
import { ReactRouterPath } from "@/utils/types";
import { ReactNode } from "react";

export function PageLink(props: {
  id: keyof typeof links;
  hash?: string;
  children?: ReactNode;
}) {
  const path = links[props.id];
  return (
    <LinkInt path={path} hash={props.hash}>
      {props.children ?? pageLinks.get(path)?.title ?? props.id}
    </LinkInt>
  );
}

const links = {
  "admin-panel": "/usage/guides/admin-panel",
  SiteConfig: "/usage/guides/siteconfig",
  Sentry: "/usage/guides/sentry",
  Linear: "/usage/guides/linear",
  Algolia: "/usage/guides/algolia",
  // refs
  "job-alert-emails": "/usage/reference/job-alert-emails",
  JobAlert: "/usage/reference/database-tables/jobalert",
  JobAlertLog: "/usage/reference/database-tables/jobalertlog",
  TaskResult: "/usage/reference/database-tables/taskresult",
  User: "/usage/reference/database-tables/user",
  // dev
  "git-commits": "/development/guides/git-commits",
  "code-style": "/development/guides/code-style",
} satisfies Record<string, ReactRouterPath>;
