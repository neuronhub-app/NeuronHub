import type { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";

export async function sendReviewCreateMutation(
  values: ReviewCreateForm.FormSchema,
): Promise<{ success: true; id: ID } | { success: false }> {
  const { recommend_to, visible_to, alternatives, parent, ...valuesRest } = values;

  const isPostUpdate = Boolean(values.id);

  const variables = {
    ...valuesRest,
    ...(isPostUpdate ? {} : { parent }),
    alternatives: alternatives ? { set: alternatives.map(alt => alt.id) } : undefined,
    visible_to_users: serialize(visible_to, "User"),
    visible_to_groups: serialize(visible_to, "Group"),
    recommended_to_users: serialize(recommend_to, "User"),
    recommended_to_groups: serialize(recommend_to, "Group"),
  };

  if (isPostUpdate) {
    const response = await mutateAndRefetchMountedQueries(
      graphql(
        `mutation PostUpdate($input: PostTypeInput!) { update_post(data: $input) { id } }`,
      ),
      { input: variables },
    );
    if (response.data?.update_post?.id) {
      return { success: true, id: response.data.update_post.id };
    }
    return { success: false };
  } else {
    const response = await mutateAndRefetchMountedQueries(
      graphql(`
        mutation PostCreate($input: PostTypeInput!) { create_post_review(data: $input) { id } }
      `),
      { input: variables },
    );
    if (response.data?.create_post_review?.id) {
      return { success: true, id: response.data.create_post_review.id };
    }
    return { success: false };
  }
}

function serialize(
  options: ReviewCreateForm.FormSchema["recommend_to" | "visible_to"],
  type: "User" | "Group",
) {
  return options
    ? { set: options.filter(opt => opt.type === type).map(opt => opt.id) }
    : undefined;
}
