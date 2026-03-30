import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagLeanFragment } from "@/graphql/fragments/tags";

export const JobFragment = graphql(
  `
    fragment JobFragment on JobType {
      id
      title
      slug
      org {
        id
        name
        website
        website_with_utm
        jobs_page_url
        is_highlighted
        description
        logo {
          url
        }
      }
      salary_min
      salary_text
      locations {
        id
        name
        city
        country
        region
        is_remote
        remote_name
      }
      url_external
      url_external_with_utm
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
