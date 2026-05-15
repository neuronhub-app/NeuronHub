import { type FragmentOf, graphql, type ResultOf } from "@/gql-tada";

export const JobsLandingPageFragment = graphql(`
  fragment JobsLandingPageFragment on JobsLandingPageType {
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
`);

export const jobsLandingPagesDoc = graphql(
  `
    query JobsLandingPagesForPrefetch {
      jobs_landing_pages {
        ...JobsLandingPageFragment
      }
    }
  `,
  [JobsLandingPageFragment],
);

const JobsLandingPagesQuery = graphql.persisted(
  "JobsLandingPagesForPrefetch",
  jobsLandingPagesDoc,
);

export const JobLandingPageDraftQuery = graphql.persisted(
  "JobLandingPageDraft",
  graphql(
    `
      query JobLandingPageDraft($pk: ID!) {
        job_landing_page(pk: $pk) {
          ...JobsLandingPageFragment
        }
      }
    `,
    [JobsLandingPageFragment],
  ),
);

export type JobsLandingPagesData = ResultOf<typeof JobsLandingPagesQuery>;
export type JobsLandingPage = FragmentOf<typeof JobsLandingPageFragment>;
