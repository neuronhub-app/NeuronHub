import { useParams } from "react-router";
import { JobList } from "@/apps/jobs/list/JobList";

export default function JobSlugRoute() {
  const params = useParams<{ slug: string }>();
  return <JobList slug={params.slug} />;
}
