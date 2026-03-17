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
  "admin-panel": "/user/guides/admin-panel",
  JobAlert: "/user/reference/database-tables/jobalert",
  JobAlertLog: "/user/reference/database-tables/jobalertlog",
  TaskResult: "/user/reference/database-tables/taskresult",
} satisfies Record<string, ReactRouterPath>;
