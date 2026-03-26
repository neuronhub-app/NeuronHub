import { useParams } from "react-router";
import { PgJobAlertList } from "@/sites/pg/pages/jobs/subscriptions/PgJobAlertList";

export default function PgJobAlertRemoveRoute() {
  const params = useParams<{ id_ext: string }>();
  return <PgJobAlertList unsubscribeByIdExt={params.id_ext} />;
}
