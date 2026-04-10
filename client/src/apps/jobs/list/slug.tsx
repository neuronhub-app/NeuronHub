import { useParams, useSearchParams } from "react-router";
import { analytics } from "@/utils/analytics";
import { JobList } from "@/apps/jobs/list/JobList";
import { useInit } from "@/utils/useInit";

export default function JobSlugRoute() {
  const params = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get("alert");

  useInit({
    isReady: Boolean(alertId && params.slug),
    onInit: async () => {
      await analytics.trackAlertClick(alertId!, params.slug!);
    },
  });

  return <JobList slug={params.slug} />;
}
