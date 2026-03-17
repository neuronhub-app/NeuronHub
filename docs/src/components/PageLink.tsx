import { pageLinks } from "@/components/buildNavTree";
import { LinkInt } from "@/components/LinkInt";
import { ReactRouterPath } from "@/utils/types";

export function PageLink(props: { id: keyof typeof links; hash?: string }) {
  const path = links[props.id];
  return (
    <LinkInt path={path} hash={props.hash}>
      {pageLinks.get(path)?.title ?? props.id}
    </LinkInt>
  );
}

const links = {
  "admin-panel": "/usage/guides/admin-panel",
  JobAlert: "/usage/reference/database-tables/jobalert",
  JobAlertLog: "/usage/reference/database-tables/jobalertlog",
  TaskResult: "/usage/reference/database-tables/taskresult",
  User: "/usage/reference/database-tables/user",
} satisfies Record<string, ReactRouterPath>;
