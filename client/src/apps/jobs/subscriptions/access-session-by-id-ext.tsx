import { JobAlertList } from "@/apps/jobs/subscriptions/JobAlertList";

export default function JobAlertAccessSession(props: { params: { id_ext: string } }) {
  return <JobAlertList accessSessionByIdExt={props.params.id_ext} />;
}
