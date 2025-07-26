import { captureException } from "@sentry/react";
import { useClient } from "urql";
import type { ReviewCreateForm } from "@/apps/reviews/create";
import { graphql } from "@/gql-tada";

export function useFormService() {
  const client = useClient();

  async function sendSubmitMutation(values: ReviewCreateForm.FormSchema) {
    const {
      recommend_to,
      visible_to,
      tags,
      parent: { alternatives, name, ...parentRest },
      ...valuesRest
    } = values;

    const res = await client
      .mutation(
        graphql(`
          mutation CreatePostReview($input: PostTypeInput!) {
            create_post_review(data: $input) {
              id
            }
          }
        `),
        {
          input: {
            ...valuesRest,
            parent: {
              ...parentRest,
              title: name, // Map 'name' to 'title' for the parent tool
            },

            alternatives: alternatives
              ? {
                  set: alternatives.map(alt => alt.id),
                }
              : undefined,

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

            tags:
              tags?.map(tag => ({
                is_vote_positive: tag.is_vote_positive,
                comment: tag.comment,
                id: tag.id,
                name: tag.name,
              })) || [],
          },
        },
      )
      .toPromise();
    if (res.error) {
      captureException(res.error);
      return { success: false, error: res.error.message } as const;
    }
    if (!res.data?.create_post_review?.id) {
      return { success: false, error: "Review creation failed - no ID returned" } as const;
    }
    
    return { success: true, reviewId: res.data.create_post_review.id } as const;
  }
  return {
    send: sendSubmitMutation,
  };
}
