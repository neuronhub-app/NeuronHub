import { schemas } from "@/components/posts/form/schemas";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";

export async function mutateReview(values: schemas.Review & { parent?: { id: ID } }) {
  const { recommend_to, visible_to, parent, ...valuesRest } = values;

  const isEditMode = Boolean(values.id);

  const variables = {
    ...valuesRest,
    ...(isEditMode ? {} : { parent }),
    ...schemas.sharable.serialize(values),
  };

  if (isEditMode) {
    const response = await mutateAndRefetchMountedQueries(
      graphql(
        `mutation PostUpdate($input: PostTypeInput!) { update_post(data: $input) { id } }`,
      ),
      { input: variables },
    );
    if (response.success) {
      return { success: true as const, id: response.data.update_post.id };
    }
    return response;
  } else {
    const response = await mutateAndRefetchMountedQueries(
      graphql(`
        mutation PostCreate($input: PostTypeInput!) { create_post_review(data: $input) { id } }
      `),
      { input: variables },
    );
    if (response.success) {
      return { success: true as const, id: response.data.create_post_review.id };
    }
    return response;
  }
}
