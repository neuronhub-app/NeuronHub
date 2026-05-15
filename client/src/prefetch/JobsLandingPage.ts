import { graphql, type ResultOf } from "@/gql-tada";

export const jobsLandingPagesDoc = graphql(`
  query JobsLandingPagesForPrefetch {
    jobs_landing_pages {
      slug
      title
      subtitle
      meta_title
      meta_description
      meta_image_url
      salary_min
      is_orgs_highlighted
      source_ext
      tags {
        name
        category_name
      }
      locations {
        algolia_filter_name
        name
        type
      }
    }
  }
`);

const JobsLandingPagesQuery = graphql.persisted(
  "JobsLandingPagesForPrefetch",
  jobsLandingPagesDoc,
);

export type JobsLandingPagesData = ResultOf<typeof JobsLandingPagesQuery>;
export type JobsLandingPage = JobsLandingPagesData["jobs_landing_pages"][number];
