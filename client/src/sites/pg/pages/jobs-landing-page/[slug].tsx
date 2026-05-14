import { Navigate, useParams } from "react-router";
import { useHeadMeta } from "@/components/useHeadMeta";
import { useHeroHeader } from "@/sites/pg/components/useHeroHeader";
import { JobList } from "@/sites/pg/pages/jobs/list/JobList";
import { urls } from "@/urls";
import type { JobsLandingPage, JobsLandingPagesData } from "@/prefetch/JobsLandingPage";
import jobsLandingPagesPrefetch from "~/graphql/prefetch/JobsLandingPages.json";

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

  const landingPages = (jobsLandingPagesPrefetch as JobsLandingPagesData).jobs_landing_pages;
  const landingPage = landingPages.find(page => page.slug === slug);
  if (landingPage) {
    return <JobsLandingPageView page={landingPage} />;
  }

  return <Navigate to={urls.jobs.slug(slug)} replace />;
}

// #AI-slop
// todo ! refac: move ot JobList.tsx - this is not a router concern.
function JobsLandingPageView(props: { page: JobsLandingPage }) {
  useHeadMeta({
    title: props.page.title,
    description: props.page.meta_description,
    ogImage: props.page.meta_image_url,
  });
  useHeroHeader({
    title: props.page.title,
    description: props.page.meta_description,
  });

  return <JobList jobsLandingPage={props.page} />;
}
