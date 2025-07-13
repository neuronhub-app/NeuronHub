import { type FragmentOf, graphql } from "@/gql-tada";

export const PostTagFragment = graphql(`
  fragment PostTagFragment on PostTagType {
    id
    votes {
      id
      is_vote_positive
      author {
        id
        # todo ! is this a sec leak? can we use hashes?
        username
      }
    }

    name
    label
    description
    is_important
    is_review_tag
    
    tag_parent {
      id
      name
    }
    author {
      id
      username
    }
  }
`);

export type PostTagFragmentType = FragmentOf<typeof PostTagFragment>;
