import { type FragmentOf, graphql } from "@/gql-tada";
import { PostCommentsFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { PostFragment } from "@/graphql/fragments/posts";

export const PostReviewFragment = graphql(
  `
    fragment PostReviewFragment on PostReviewType {
      ...PostFragment

      review_importance
      review_usage_status
      review_rating
      review_experience_hours
      reviewed_at
    }
  `,
  [PostFragment],
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
export type PostReviewDetailFragmentType = FragmentOf<typeof PostReviewDetailFragment>;
export type PostReviewFragmentType = FragmentOf<typeof PostReviewFragment>;

export function isPostReviewType(
  post: PostFragmentType | PostReviewFragmentType,
): post is PostReviewFragmentType {
  return post.__typename === "PostReviewType";
}
