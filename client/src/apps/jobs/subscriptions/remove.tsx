import { JobAlertList } from "@/apps/jobs/subscriptions/JobAlertList";
import type { Route } from "~/react-router/jobs/subscriptions/+types/remove";

export default function JobAlertRemoveRoute(props: Route.ComponentProps) {
  return <JobAlertList unsubscribeAlertIdExt={props.params.id_ext} />;
}
