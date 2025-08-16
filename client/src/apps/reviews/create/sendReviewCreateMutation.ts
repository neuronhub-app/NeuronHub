import type { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";

export async function sendReviewCreateMutation(values: ReviewCreateForm.FormSchema) {
  const { recommend_to, visible_to, alternatives, ...valuesRest } = values;

  const response = await mutateAndRefetchMountedQueries(
    graphql(`
			mutation CreatePostReview($input: PostTypeInput!) {
				create_post_review(data: $input) { id }
			}
		`),
    {
      input: {
        ...valuesRest,

        alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,

        // todo feat: restore comments + votes
        // alternatives: alternatives?.map(alternative => ({
        //   alternative: { set: alternative.id },
        //   is_vote_positive: alternative.is_vote_positive,
        //   comment: alternative.comment,
        // })),

        visible_to_users: {
          set: visible_to?.filter(option => option.user).map(user => user.id),
        },
        visible_to_groups: {
          set: visible_to?.filter(option => option.group).map(group => group.id),
        },

        recommended_to_users: {
          set: values.recommend_to?.filter(option => option.user).map(user => user.id),
        },
        recommended_to_groups: {
          set: values.recommend_to?.filter(option => option.group).map(group => group.id),
        },
      },
    },
  );
  if (response.success) {
    return { success: true, reviewId: response.data!.create_post_review.id } as const;
  }
}
