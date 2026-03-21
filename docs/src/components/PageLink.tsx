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
  "job-alert-emails": "/usage/reference/job-alert-emails",
  JobAlert: "/usage/reference/database-tables/jobalert",
  Sentry: "/usage/guides/sentry",
  Algolia: "/usage/guides/algolia",
  JobAlertLog: "/usage/reference/database-tables/jobalertlog",
  SiteConfig: "/usage/reference/database-tables/siteconfig",
  TaskResult: "/usage/reference/database-tables/taskresult",
  User: "/usage/reference/database-tables/user",
} satisfies Record<string, ReactRouterPath>;
