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
      tool: { alternatives, ...toolRest },
      ...valuesRest
    } = values;

    const res = await client
      .mutation(CreateReviewDoc, {
        input: {
          tool: {
            alternatives: alternatives?.map(alternative => ({
              tool_alternative: { set: alternative.id },
              is_vote_positive: alternative.is_vote_positive,
              comment: alternative.comment,
            })),
            ...toolRest,
          },

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

          ...valuesRest,
          tags,
        },
      })
      .toPromise();
    if (res.error) {
      captureException(res.error);
      return { success: false, error: res.error.message } as const;
    }
    return { success: true } as const;
  }
  return {
    send: sendSubmitMutation,
  };
}

const CreateReviewDoc = graphql(`
  mutation CreatePostReview($input: PostTypeInput!) {
    create_post(data: $input) {
      id
    }
  }
`);
