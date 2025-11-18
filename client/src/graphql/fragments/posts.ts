import { type FragmentOf, graphql } from "@/gql-tada";
import { PostTagFragment } from "@/graphql/fragments/tags";

export const PostFragment = graphql(
  `
    fragment PostFragment on PostTypeI {
      id
      __typename
      type
      category
      title
      content_polite
      content_direct
      content_rant
      source
      source_author
      post_source {
        id
        id_external
        created_at_external
				score
				rank
				url_of_source
      }
      image {
        url
        name
      }
      crunchbase_url
      github_url
      url
      domain
        
      comments_count
      
      author {
        id
        username
        avatar {
          url
        }
      }
      votes {
        id
        is_vote_positive
      }
      parent {
        id
        __typename
        title
        ... on PostToolType {
          tool_type
          content_polite
          content_direct
          content_rant
          domain
          github_url
          crunchbase_url
        }
        tags {
          ...PostTagFragment
        }
      }
      updated_at

      tags {
        ...PostTagFragment
      }
    }
  `,
  [PostTagFragment],
);

export const CommentFieldsFragment = graphql(
  `
    fragment CommentFieldsFragment on PostTypeI {
      id
      type
      __typename
      author {
        id
        username
        avatar {
          url
        }
      }
      parent {
        id
        type
      }
      parent_root {
        id
      }
      content_polite
      content_direct
      content_rant
      created_at
      updated_at
      source_author

      post_source {
        id
        id_external
        created_at_external
        json
      }
      votes {
        id
        is_vote_positive
        author {
          id
        }
      }
    }
  `,
);

export const PostDetailFragment = graphql(
  `
    fragment PostDetailFragment on PostTypeI {
      ...PostFragment
      comments {
        ...CommentFieldsFragment
      }
    }
  `,
  [PostFragment, CommentFieldsFragment],
);

// #AI it was redefined by AI during #91 and #94, in an idiotic way - review later #prob-redundant
// for now i leave it to on gql.tada to error up on wrong usage
export type PostCommentType = FragmentOf<typeof CommentFieldsFragment>;

export type PostFragmentType = FragmentOf<typeof PostFragment>;

export type PostDetailFragmentType = FragmentOf<typeof PostDetailFragment>;

export const PostEditFragment = graphql(
  `
    fragment PostEditFragment on PostTypeI {
      ...PostFragment

      content_private

      visibility
      recommended_to_users {
        id
        username
      }
      recommended_to_groups {
        id
        name
      }
      visible_to_users {
        id
        username
      }
      visible_to_groups {
        id
        name
      }
    }
  `,
  [PostFragment],
);

export type PostEditFragmentType = FragmentOf<typeof PostEditFragment>;

export function isTool(post: PostFragmentType): boolean {
  return post.__typename === "PostToolType";
}
