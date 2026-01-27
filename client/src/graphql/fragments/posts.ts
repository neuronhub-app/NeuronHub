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
      content_polite_html_ssr
      source
      source_author
      post_source {
        id
        id_external
        created_at_external
				score
				rank
				url_of_source

				user_source {
					id
					username
					score
					about
					created_at_external
				}
      }
      image {
        url
        name
      }
      crunchbase_url
      github_url
      url
      domain
        
      comment_count
      
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
      created_at
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

      content_polite

      created_at
      updated_at

      parent {
        id
      }
      parent_root {
        id
      }
      votes {
        id
        is_vote_positive
      }
      author {
        id
        username
        avatar {
          url
        }
      }
      post_source {
        id
        id_external
        created_at_external
  
        user_source {
          id
          username
        }
      }
    }
  `,
);

export const PostAuthorFragment = graphql(`
  fragment PostAuthorFragment on PostTypeI {
    post_source {
      id
      id_external
      created_at_external

      user_source {
        id
        username
        score
        about
        created_at_external
      }
    }
  }
`);
export type PostAuthorFragmentType = FragmentOf<typeof PostAuthorFragment>;

export const PostDetailFragment = graphql(
  `
    fragment PostDetailFragment on PostTypeI {
      ...PostFragment
    }
  `,
  [PostFragment],
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
