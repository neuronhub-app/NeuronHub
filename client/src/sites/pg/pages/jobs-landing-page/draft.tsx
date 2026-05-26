import { useParams } from "react-router";

import { useApolloQuery } from "@/graphql/useApolloQuery";
import { JobLandingPageDraftQuery } from "@/prefetch/JobsLandingPage";
import { JobsLandingPageView } from "@/sites/pg/pages/jobs-landing-page/JobsLandingPageView";

export default function JobsLandingPageDraftRoute() {
  const id = useParams<{ id: string }>().id!;
  const { data, isLoadingFirstTime } = useApolloQuery(JobLandingPageDraftQuery, { pk: id });

  if (isLoadingFirstTime) {
    return <p>Loading…</p>;
  }
  if (!data?.job_landing_page) {
    return <p>Landing page not found.</p>;
  }
  return <JobsLandingPageView page={data.job_landing_page} />;
}
