import { useParams } from "react-router";
import { PgJobAlertList } from "@/sites/pg/pages/jobs/subscriptions/PgJobAlertList";

export default function PgJobAlertAccessSession() {
  const params = useParams<{ id_ext: string }>();
  return <PgJobAlertList accessSessionByIdExt={params.id_ext} />;
}
