import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagLeanFragment } from "@/graphql/fragments/tags";

export const JobFragment = graphql(
  `
    fragment JobFragment on JobType {
      id
      title
      org {
        id
        name
        website
        jobs_page_url
        is_highlighted
        description
        logo {
          url
        }
      }
      is_remote
      is_remote_friendly
      salary_min
      salary_text
      tags_country {
        ...PostTagLeanFragment
      }
      tags_city {
        ...PostTagLeanFragment
      }
      locations {
        id
        name
        city
        country
        region
        is_remote
      }
      url_external
      is_published
      posted_at
      closes_at
      description

      tags_skill {
        ...PostTagLeanFragment
      }
      tags_area {
        ...PostTagLeanFragment
      }
      tags_education {
        ...PostTagLeanFragment
      }
      tags_experience {
        ...PostTagLeanFragment
      }
      tags_workload {
        ...PostTagLeanFragment
      }
    }
  `,
  [PostTagLeanFragment],
);

export type JobFragmentType = FragmentOf<typeof JobFragment>;
