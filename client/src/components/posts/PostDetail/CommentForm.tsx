import { Button, HStack, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { PostSharableFields } from "@/components/posts/form/PostSharableFields";
import { schemas } from "@/components/posts/form/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import type { PostEditFragmentType } from "@/graphql/fragments/posts";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { PostTypeEnum, Visibility } from "~/graphql/enums";

export function CommentForm(
  props:
    | {
        mode: "create";
        parentId: ID;
        onCancel?: () => void;
      }
    | {
        mode: "edit";
        comment: PostEditFragmentType;
        onEditFinish: () => void;
      },
) {
  const isEditMode = props.mode === "edit";

  const state = useValtioProxyRef({ isShowVisibilityField: isEditMode });

  const schema = z
    .object({
      content_polite: z.string().min(1).max(5000),
    })
    .extend(schemas.sharable.Schema.shape);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          content_polite: props.comment.content_polite,
          ...schemas.sharable.deserialize(props.comment),
        }
      : {
          content_polite: "",
          visibility: Visibility.Private,
        },
  });

  async function handleSubmit(data: z.infer<typeof schema>) {
    if (isEditMode) {
      const response = await commentUpdate({
        id: props.comment.id,
        ...data,
      });
      if (response.success) {
        toast.success("Comment updated");
        props.onEditFinish();
      } else {
        showError(response.errorMessage);
      }
    } else {
      const response = await commentCreate({
        parentId: props.parentId,
        ...data,
      });
      if (response.success) {
        toast.success("Comment posted");
        form.reset();
        state.mutable.isShowVisibilityField = false;
        if (props.onCancel) {
          props.onCancel();
        }
      } else {
        showError(response.errorMessage);
      }
    }

    function showError(error: string | JSX.Element) {
      toast.error(`Failed comment ${isEditMode ? "update" : "creation"}: ${error}`);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack gap="gap.sm" pt="gap.md">
          <FormChakraTextarea
            field={{ name: "content_polite", control: form.control }}
            placeholder="Write a comment..."
            errorText={form.formState.errors.content_polite?.message}
            {...ids.set(isEditMode ? ids.comment.form.textareaEdit : ids.comment.form.textarea)}
          />

          <Checkbox
            checked={state.snap.isShowVisibilityField}
            onCheckedChange={_ => {
              state.mutable.isShowVisibilityField = !state.mutable.isShowVisibilityField;
            }}
            {...ids.set(ids.post.form.sharingFieldsToggle)}
            size="xs"
          >
            Visilibity options
          </Checkbox>

          {state.snap.isShowVisibilityField && <PostSharableFields isShowRecommendTo={false} />}

          {!isEditMode && (
            <HStack>
              {props.onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => props.onCancel?.()}
                  {...ids.set(ids.comment.form.cancelBtn)}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                variant="subtle"
                size="xs"
                loading={form.formState.isSubmitting}
                {...ids.set(ids.post.form.btn.submit)}
              >
                Post
              </Button>
            </HStack>
          )}

          {isEditMode && (
            <HStack>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => props.onEditFinish()}
                {...ids.set(ids.comment.form.cancelBtn)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="subtle"
                size="xs"
                loading={form.formState.isSubmitting}
                {...ids.set(ids.post.form.btn.submit)}
              >
                Save
              </Button>
            </HStack>
          )}
        </Stack>
      </form>
    </FormProvider>
  );
}

async function commentCreate(
  input: { parentId: ID; content_polite: string } & schemas.sharable.Schema,
) {
  return mutateAndRefetchMountedQueries(
    graphql(
      `mutation CommentUpdate($data: PostTypeInput!) { post_update_or_create(data: $data) { id } }`,
    ),
    {
      data: {
        parent: { id: input.parentId },
        type: PostTypeEnum.Comment,
        content_polite: input.content_polite,
        tags: [],
        ...schemas.sharable.serialize(input),
      },
    },
  );
}

async function commentUpdate(
  input: { id: ID; content_polite: string } & schemas.sharable.Schema,
) {
  return mutateAndRefetchMountedQueries(
    graphql(
      `mutation CommentUpdate($data: PostTypeInput!) { post_update_or_create(data: $data) { id } }`,
    ),
    {
      data: {
        id: input.id,
        type: PostTypeEnum.Comment,
        content_polite: input.content_polite,
        tags: [],
        ...schemas.sharable.serialize(input),
      },
    },
  );
}
