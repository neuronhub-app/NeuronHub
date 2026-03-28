import { JobAlertList } from "@/apps/jobs/subscriptions/JobAlertList";

export default function JobAlertRemoveRoute(props: { params: { id_ext: string } }) {
  return <JobAlertList unsubscribeByIdExt={props.params.id_ext} />;
}
