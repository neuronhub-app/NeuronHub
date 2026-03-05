import { JobList } from "@/apps/jobs/list/JobList";
import type { Route } from "~/react-router/jobs/list/+types/slug";

export default function JobSlugRoute(props: Route.ComponentProps) {
  return <JobList slug={props.params.slug} />;
}
