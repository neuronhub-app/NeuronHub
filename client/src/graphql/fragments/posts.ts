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
      posts_source {
        id
        id_external
        created_at_external
        json
      }
      image {
        url
        name
      }
      crunchbase_url
      github_url
      url
      domain
      
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
        author {
          id
        }
      }
      comments {
        id
        type
        content_polite
        content_direct
        content_rant
        author {
          id
          username
        }
        parent {
          id
          type
        }
        created_at
        updated_at
        comments {
          id
          comments {
            id
          }
        }
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
      }
      content_polite
      content_direct
      content_rant
      visibility
      created_at
      updated_at
      source_author
      posts_source {
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

// #AI. questionable to say the least.
export const PostCommentsFragment = graphql(
  `
    fragment PostCommentsFragment on PostTypeI {
      comments {
        ...CommentFieldsFragment
        comments {
          ...CommentFieldsFragment
          comments {
            ...CommentFieldsFragment
            comments {
              ...CommentFieldsFragment
              comments {
                ...CommentFieldsFragment
                comments {
                  ...CommentFieldsFragment
                  comments {
                    ...CommentFieldsFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [CommentFieldsFragment],
);

export type PostCommentType = FragmentOf<typeof PostCommentsFragment>["comments"][number];

export const PostDetailFragment = graphql(
  `
    fragment PostDetailFragment on PostTypeI {
      ...PostFragment
      ...PostCommentsFragment
    }
  `,
  [PostFragment, PostCommentsFragment],
);

export type PostFragmentType = FragmentOf<typeof PostFragment>;

export type PostDetailFragmentType = FragmentOf<typeof PostDetailFragment>;

export const PostEditFragment = graphql(
  `
    fragment PostEditFragment on PostTypeI {
      ...PostFragment
      ...PostCommentsFragment

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
  [PostFragment, PostCommentsFragment],
);

export type PostEditFragmentType = FragmentOf<typeof PostEditFragment>;

export function isTool(post: PostFragmentType): boolean {
  return post.__typename === "PostToolType";
}
