import { Navigate, useLocation, useParams } from "react-router";

import jobsLandingPagesPrefetch from "~/graphql/prefetch/JobsLandingPages.json";

import type { JobsLandingPagesData } from "@/prefetch/JobsLandingPage";
import { JobsLandingPageView } from "@/sites/pg/pages/jobs-landing-page/JobsLandingPageView";
import { urls } from "@/urls";

/**
 * todo ! fix: makes page-404.tsx unreachable -> drop once old JobAlerts using /:slug are unused (ie June/July). See #169.
 *
 * #AI: `/:slug` is a catch-all under PgLayout: matches every single-segment URL
 * (incl. typos like `/aboutt`). Legacy `/job-slug` backlinks are absorbed by
 * `<Navigate to={urls.jobs.slug(slug)}>` so RR's history is consistent. The
 * downside: top-level 404s land on `/jobs/<slug>` "Job not found" rather than
 * the `*` → `page-404.tsx` route. Accepted for legacy backlink coverage.
 */
export default function JobsLandingPageRoute() {
  const slug = useParams<{ slug: string }>().slug!;
  const location = useLocation();

  const landingPages = (jobsLandingPagesPrefetch as JobsLandingPagesData).jobs_landing_pages;
  const landingPage = landingPages.find(page => page.slug === slug);
  if (landingPage) {
    return <JobsLandingPageView page={landingPage} />;
  }

  return <Navigate to={{ pathname: urls.jobs.slug(slug), search: location.search }} replace />;
}
