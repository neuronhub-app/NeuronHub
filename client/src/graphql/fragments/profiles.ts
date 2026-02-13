import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagLeanFragment } from "@/graphql/fragments/tags";

export const ProfileMatchFragment = graphql(`
  fragment ProfileMatchFragment on ProfileMatchType {
    id
    match_score_by_llm
    match_reason_by_llm
    match_score
    match_review
    match_processed_at
    is_scored_by_llm
    is_reviewed_by_user
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
        ...PostTagLeanFragment
      }
      interests {
        ...PostTagLeanFragment
      }
      match {
        ...ProfileMatchFragment
      }
    }
  `,
  [PostTagLeanFragment, ProfileMatchFragment],
);

export type ProfileFragmentType = FragmentOf<typeof ProfileFragment>;
export type ProfileMatchFragmentType = FragmentOf<typeof ProfileMatchFragment>;
