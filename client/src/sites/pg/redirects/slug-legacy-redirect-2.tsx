import { useEffect } from "react";
import { useParams } from "react-router";
import { JobList } from "@/sites/pg/pages/jobs/list/JobList";
import { urls } from "@/urls";

/**
 * Legacy `/:slug` for ext backlinks. Soft-swaps to `/jobs/:slug` wo UI re-mounting.
 */
export default function SlugLegacyRedirect2() {
  const params = useParams<{ slug: string }>();

  useEffect(() => {
    if (!params.slug) {
      return;
    }
    window.history.replaceState(null, "", urls.jobs.slug(params.slug));
  }, [params.slug]);

  return <JobList slug={params.slug} />;
}
