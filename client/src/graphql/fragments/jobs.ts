import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagLeanFragment } from "@/graphql/fragments/tags";

export const JobFragment = graphql(
  `
    fragment JobFragment on JobType {
      id
      title
      org
      is_remote
      is_remote_friendly
      is_visa_sponsor
      salary_min
      salary_max
      country
      city
      url_external
      posted_at
      closes_at
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
