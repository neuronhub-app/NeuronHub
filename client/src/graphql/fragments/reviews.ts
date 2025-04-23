import type { Post } from "@/apps/posts/list/PostList";
import type { PostReview } from "@/apps/reviews/list/PostReviewList";
import { type FragmentOf, graphql } from "@/gql-tada";
import { PostCommentsFragment, PostWithoutToolFragment } from "@/graphql/fragments/posts";
import { ToolFragment } from "@/graphql/fragments/tools";

export const PostReviewFragment = graphql(
  `
    fragment PostReviewFragment on PostReviewType {
      ...PostWithoutToolFragment

      importance
      is_private
      is_review_later
      usage_status
      rating
      experience_hours

      reviewed_at

      tool {
        ...ToolFragment
      }
    }
  `,
  [ToolFragment, PostWithoutToolFragment],
);

export const PostReviewDetailFragment = graphql(
  `
    fragment PostReviewDetailFragment on PostReviewType {
      ...PostReviewFragment
      ...PostCommentsFragment
    }
  `,
  [PostReviewFragment, PostCommentsFragment],
);
export type PostReviewDetailType = FragmentOf<typeof PostReviewDetailFragment>;

export function isPostReviewType(post: Post | PostReview): post is PostReview {
  return post.__typename === "PostReviewType";
}
