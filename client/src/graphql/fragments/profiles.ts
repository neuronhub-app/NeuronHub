import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagFragment } from "@/graphql/fragments/tags";

export const ProfileMatchFragment = graphql(`
  fragment ProfileMatchFragment on ProfileMatchType {
    id
    match_score_by_llm
    match_reason_by_llm
    match_score
    match_review
  }
`);

export const ProfileFragment = graphql(
  `
    fragment ProfileFragment on ProfileType {
      id
      first_name
      last_name
      company
      job_title
      career_stage
      biography
      seeks
      offers
        
      recruitment
      seeking_work
        
      country
      city

      url_conference
      url_linkedin

      skills {
        ...PostTagFragment
      }
      interests {
        ...PostTagFragment
      }
      my_match {
        ...ProfileMatchFragment
      }
    }
  `,
  [PostTagFragment, ProfileMatchFragment],
);

export type ProfileFragmentType = FragmentOf<typeof ProfileFragment>;
export type ProfileMatchFragmentType = FragmentOf<typeof ProfileMatchFragment>;
