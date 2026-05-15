import { useHeadMeta } from "@/components/useHeadMeta";
import type { JobsLandingPage } from "@/prefetch/JobsLandingPage";
import { useHeroHeader } from "@/sites/pg/components/useHeroHeader";
import { JobList } from "@/sites/pg/pages/jobs/list/JobList";

export function JobsLandingPageView(props: { page: JobsLandingPage }) {
  useHeadMeta({
    title: props.page.meta_title,
    description: props.page.meta_description,
    ogImage: props.page.meta_image_url,
  });
  useHeroHeader({
    title: props.page.title,
    description: props.page.subtitle,
  });

  return <JobList jobsLandingPage={props.page} />;
}
