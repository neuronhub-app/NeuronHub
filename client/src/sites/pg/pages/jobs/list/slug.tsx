import { useParams } from "react-router";
import { JobList } from "@/sites/pg/pages/jobs/list/JobList";

export default function JobSlugRoute() {
  const params = useParams<{ slug: string }>();
  return <JobList slug={params.slug} />;
}
