import { type UseFormReturn, useFormContext as useFormContextOriginal } from "react-hook-form";
import { z } from "zod/v4";
import type { PostEditFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewEditFragmentType } from "@/graphql/fragments/reviews";
import { PostCategory, PostTypeEnum, UsageStatus, Visibility } from "~/graphql/enums";

export const UserType = z.enum(["User", "Group"]);

/**
 * Caveats:
 * - `z.array().default([])` - breaks TS types. No idea. We have to init it as `[]`, or form thinks it's `undefined`.
 * - `z.enum().default(<any valid enum string>)` - breaks the validation or crashes JetBrains Gateway. Set it on form then.
 *    Eg `.default(Visibility.Private)` works, but doesn't display in UI.
 */
export namespace schemas {
  // Post fields shared by all
  export const Abstract = z.object({
    id: z.string().nullable(),
    title: z.string().min(1),
    content_polite: z.string().optional(),
    content_direct: z.string().optional(),
    content_rant: z.string().optional(),
    category: z.enum(enumConvert(PostCategory)).optional().nullable(),
    source: z.string().optional(),
    source_author: z.string().optional(),
    tags: getSelectVotableSchema(),
  });
  export type PostAbstract = z.infer<typeof Abstract>;
  export type PostAbstractForm = UseFormReturn<PostAbstract>;

  export function useFormContextAbstract(
    fieldsRequired: Array<
      "title" | "content_polite" | "content_direct" | "content_rant" | "tags"
    > = ["title", "content_polite"],
  ): PostAbstractForm {
    const form: PostAbstractForm = useFormContextOriginal();
    for (const fieldRequired of fieldsRequired) {
      const state = form.getFieldState(fieldRequired);
      if (state.isDirty === undefined) {
        throw new Error(`Missing "${fieldRequired}" form field`);
      }
    }
    return form;
  }

  export namespace sharable {
    export const Schema = z.object({
      visibility: z.enum(enumConvert(Visibility)),
      visible_to: getSelectSchema().optional(),
      recommend_to: getSelectSchema().optional(),
      content_private: z.string().optional(),
    });
    export type Schema = z.infer<typeof Schema>;
    export type Form = UseFormReturn<Schema>;

    export function useFormContext(
      fieldsRequired: Array<"visible_to" | "visibility" | "recommend_to"> = ["recommend_to"],
    ): Form {
      const form: Form = useFormContextOriginal();
      for (const fieldRequired of fieldsRequired) {
        const state = form.getFieldState(fieldRequired);
        if (state.isDirty === undefined) {
          throw new Error(`Missing "${fieldRequired}" form field`);
        }
      }
      return form;
    }

    export function serialize(fields: Schema) {
      function serializeField(
        options: Schema["visible_to" | "recommend_to"],
        type: "User" | "Group",
      ) {
        return options
          ? { set: options.filter(opt => opt.type === type).map(opt => opt.id) }
          : undefined;
      }
      return {
        visible_to_users: serializeField(fields.visible_to, "User"),
        visible_to_groups: serializeField(fields.visible_to, "Group"),
        recommended_to_users: serializeField(fields.recommend_to, "User"),
        recommended_to_groups: serializeField(fields.recommend_to, "Group"),
      };
    }

    export function deserialize(post: PostReviewEditFragmentType | PostEditFragmentType) {
      return {
        visibility: Schema.shape.visibility.parse(post.visibility),
        recommend_to: deserializeOptions(post.recommended_to_users, post.recommended_to_groups),
        visible_to: deserializeOptions(post.visible_to_users, post.visible_to_groups),
        content_private: post.content_private,
      };
    }

    function getSelectSchema() {
      return z.array(
        z.discriminatedUnion("type", [
          z.object({
            id: z.string(),
            type: z.literal(UserType.enum.User),
            message: z.string().nullish(),
            user: z.object({
              id: z.string(),
              name: z.string(),
            }),
            label: z.string().optional(),
          }),
          z.object({
            id: z.string(),
            type: z.literal(UserType.enum.Group),
            message: z.string().nullish(),
            group: z.object({
              id: z.string(),
              name: z.string(),
            }),
            label: z.string().optional(),
          }),
        ]),
      );
    }

    function deserializeOptions(
      users: Array<{ id: string; username: string }>,
      groups: Array<{ id: string; name: string }>,
    ) {
      const userOptions = users.map(user => ({
        id: user.id,
        type: "User" as const,
        user: { id: user.id, name: user.username },
        label: user.username,
        message: null,
      }));

      const groupOptions = groups.map(group => ({
        id: group.id,
        type: "Group" as const,
        group,
        label: group.name,
        message: null,
      }));

      return [...userOptions, ...groupOptions];
    }
  }

  export const Post = Abstract.safeExtend(sharable.Schema.shape);
  export type Post = z.infer<typeof Post>;

  export namespace post {
    export function deserialize(data: PostEditFragmentType): Post {
      return {
        id: data.id,
        title: data.title,
        content_polite: data.content_polite,
        content_direct: data.content_direct,
        content_rant: data.content_rant,
        source: data.source,
        source_author: data.source_author,
        category: data.category as PostCategory | null,
        tags:
          data.tags?.map(tag => ({
            id: tag.id,
            name: tag.name,
            label: tag.label,
            is_vote_positive: null,
          })) ?? [],
        ...sharable.deserialize(data),
      };
    }

    export function serialize(values: Post) {
      return {
        id: values.id,
        title: values.title,
        content_polite: values.content_polite,
        content_direct: values.content_direct,
        content_rant: values.content_rant,
        source: values.source,
        source_author: values.source_author,
        category: values.category ?? null,
        tags: values.tags
          ? values.tags.map(tag => ({
              id: tag.id,
              name: tag.name,
              comment: tag.comment,
              is_vote_positive: tag.is_vote_positive,
            }))
          : undefined,
        ...sharable.serialize(values),
      };
    }
  }

  export const Review = Abstract.safeExtend(sharable.Schema.shape).safeExtend({
    review_rating: z.number().min(0).max(100).nullable(),
    review_importance: z.number().min(0).max(100).nullable(),
    review_usage_status: z.enum(enumConvert(UsageStatus)).nullable(),
    review_tags: getSelectVotableSchema(),
    reviewed_at: z.iso.date().optional(),
    is_review_later: z.boolean().optional(),
  });
  export type Review = z.infer<typeof Review>;
  export type ReviewForm = UseFormReturn<Review>;

  // excludes `sharable.Schema`, because it's always public
  export const Tool = Abstract.safeExtend({
    type: z.enum(enumConvert(PostTypeEnum)).default(PostTypeEnum.Tool).optional(),
    tool_type: z
      .union([
        z.literal("Program"),
        z.literal("Material"),
        z.literal("Product"),
        z.literal("SaaS"),
        z.literal("App"),
        z.literal("Other"),
      ])
      .optional(),
    image: z.file().nullable().optional(),
    alternatives: getSelectVotableSchema().optional(),
    github_url: z
      .union([z.string().includes("github.com").includes("/"), z.string().trim().length(0)])
      .optional(),
    crunchbase_url: z
      .union([z.string().includes("crunchbase.com").includes("/"), z.string().trim().length(0)])
      .optional(),
    domain: z.string().optional(),
  });
  export type Tool = z.infer<typeof Tool>;

  function getSelectVotableSchema() {
    return z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        is_vote_positive: z.boolean().nullish(),
        comment: z.string().optional(),
        label: z.string().optional(),
      }),
    );
  }
}

// unfuck TS enums
function enumConvert<E extends Record<string, string>>(enumObj: E): Array<E[keyof E]> {
  // @ts-expect-error
  return Object.values(enumObj);
}
