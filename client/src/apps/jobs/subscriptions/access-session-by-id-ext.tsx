import { JobAlertList } from "@/apps/jobs/subscriptions/JobAlertList";
import type { Route } from "~/react-router/jobs/subscriptions/+types/access-session-by-id-ext";

export default function JobAlertAccessSession(props: Route.ComponentProps) {
  return <JobAlertList accessSessionByIdExt={props.params.id_ext} />;
}
