import { type FragmentOf, graphql } from "@/gql-tada";

export const PostTagFragment = graphql(`
  fragment PostTagFragment on PostTagType {
    id
    votes {
      id
			post {
				id
			}
      author {
        id
        # todo ! is this a sec leak? can we use hashes?
        username
      }
      is_vote_positive
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
		tag_children {
			id
		}
  }
`);

export type PostTagFragmentType = FragmentOf<typeof PostTagFragment>;
