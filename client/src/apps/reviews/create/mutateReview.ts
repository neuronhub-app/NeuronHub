import { schemas } from "@/components/posts/form/schemas";
import { graphql, type ID } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { PostTypeEnum } from "~/graphql/enums";

export async function mutateReview(values: schemas.Review & { parent?: { id: ID } }) {
  const { recommend_to, visible_to, parent, tags, review_tags, ...valuesRest } = values;

  const isEditMode = Boolean(values.id);

  const response = await mutateAndRefetchMountedQueries(
    graphql.persisted(
      "ReviewUpdateOrCreate",
      graphql(`
      mutation ReviewUpdateOrCreate($input: PostTypeInput!) {
        post_update_or_create(data: $input) { id parent { id } }
      }
    `),
    ),
    {
      input: {
        ...(isEditMode ? {} : { parent }),
        type: PostTypeEnum.Review,
        tags: tags.map(tag => {
          const { label, ...tagValues } = tag;
          return tagValues;
        }),
        review_tags: review_tags?.map(tag => {
          const { label, ...tagValues } = tag;
          return tagValues;
        }),
        ...schemas.sharable.serialize(values),
        ...valuesRest,
      },
    },
  );

  if (response.success) {
    return {
      success: true as const,
      data: { id: response.data.post_update_or_create.id },
    };
  }
  return response;
}
