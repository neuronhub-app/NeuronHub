import { Button, HStack, Show, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type JSX, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { usePostCommentDraft } from "@/components/posts/PostDetail/usePostCommentDraft";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";

export function CommentForm(
  props:
    | { mode: "create"; parentId: ID }
    | {
        mode: "edit";
        comment: Pick<PostCommentType, "id" | "content" | "parent">;
        onCancel: () => void;
        onSave: () => void;
      },
) {
  const isEditMode = props.mode === "edit";
  const draft = usePostCommentDraft(isEditMode ? `edit-${props.comment.id}` : props.parentId);

  const schema = z.object({
    content: z.string().min(1).max(5000),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: draft.content || (isEditMode ? props.comment.content : ""),
    },
  });

  const content = form.watch("content");
  useEffect(() => {
    draft.update(content ?? "");
  }, [content, draft.update]);

  async function handleSubmit(data: z.infer<typeof schema>) {
    if (isEditMode) {
      const response = await commentUpdate({
        id: props.comment.id,
        content: data.content,
        parentId: props.comment.parent?.id,
      });
      if (response.success) {
        toast.success(strs.updatedComment);
        draft.clear();
        props.onSave();
      } else {
        showError(response.error);
      }
    } else {
      const response = await commentCreate({ parentId: props.parentId, content: data.content });
      if (response.success) {
        toast.success(strs.createdComment);
        form.reset();
        draft.clear();
      } else {
        showError(response.error);
      }
    }

    function showError(error: string | JSX.Element) {
      toast.error(`Failed comment ${isEditMode ? "update" : "creation"}: ${error}`);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap={4}>
        <FormChakraTextarea
          field={{ name: "content", control: form.control }}
          placeholder="Write a comment..."
          errorText={form.formState.errors.content?.message}
          {...ids.set(ids.comment.form.textarea)}
        />
        <Show
          when={!isEditMode}
          fallback={
            <HStack>
              <Button
                type="submit"
                variant="subtle"
                size="sm"
                loading={form.formState.isSubmitting}
                {...ids.set(ids.comment.form.saveBtn)}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  draft.clear();
                  if (props.mode === "edit") {
                    props.onCancel();
                  }
                }}
                {...ids.set(ids.comment.form.cancelBtn)}
              >
                Cancel
              </Button>
            </HStack>
          }
        >
          <Button
            type="submit"
            variant="subtle"
            size="sm"
            alignSelf="flex-start"
            loading={form.formState.isSubmitting}
            {...ids.set(ids.comment.form.submitBtn)}
          >
            Post
          </Button>
        </Show>
      </Stack>
    </form>
  );
}

export const strs = {
  createdComment: "Comment posted",
  updatedComment: "Comment updated",
};

async function commentCreate(input: { parentId: ID; content: string }) {
  return mutateAndRefetchMountedQueries(
    graphql(
      `mutation CommentUpdate($data: PostTypeInput!) { create_post_comment(data: $data) { id } }`,
    ),
    {
      data: {
        parent: { id: input.parentId, tags: [] },
        content: input.content,
        tags: [],
        visibility: "PUBLIC",
      },
    },
  );
}

async function commentUpdate(input: { id: ID; content: string; parentId?: ID }) {
  return mutateAndRefetchMountedQueries(
    graphql(`mutation CommentUpdate($data: PostTypeInput!) { update_post(data: $data) { id } }`),
    {
      data: {
        id: input.id,
        // todo refac: prob redundant, either here or in Django
        parent: input.parentId ? { id: input.parentId, tags: [] } : undefined,
        content: input.content,
        tags: [],
        visibility: "PUBLIC",
      },
    },
  );
}
