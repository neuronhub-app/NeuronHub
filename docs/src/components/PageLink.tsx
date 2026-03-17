import { LinkInt } from "@/components/LinkInt";
import { ReactRouterPath } from "@/utils/types";

export function PageLink(props: { id: keyof typeof links }) {
  return <LinkInt path={links[props.id]}>{props.id}</LinkInt>;
}

// todo ? refac: drop - use routes.ts
const links = {
  "admin-panel": "/user/guides/admin-panel",
  JobAlert: "/user/reference/database-tables/jobalert",
  JobAlertLog: "/user/reference/database-tables/jobalertlog",
  TaskResult: "/user/reference/database-tables/taskresult",
} satisfies Record<string, ReactRouterPath>;
