import { Button, HStack, Show, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { PostTypeEnum, Visibility } from "~/graphql/enums";

export function CommentForm(
  props:
    | {
        mode: "create";
        parentId: ID;
      }
    | {
        mode: "edit";
        comment: Pick<PostCommentType, "id" | "content_polite" | "parent">;
        onEditFinish: () => void;
      },
) {
  const isEditMode = props.mode === "edit";

  const schema = z.object({
    content_polite: z.string().min(1).max(5000),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      content_polite: isEditMode ? props.comment.content_polite : "",
    },
  });

  async function handleSubmit(data: z.infer<typeof schema>) {
    if (isEditMode) {
      const response = await commentUpdate({
        id: props.comment.id,
        content_polite: data.content_polite,
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
        content_polite: data.content_polite,
      });
      if (response.success) {
        toast.success("Comment posted");
        form.reset();
      } else {
        showError(response.errorMessage);
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
          field={{ name: "content_polite", control: form.control }}
          placeholder="Write a comment..."
          errorText={form.formState.errors.content_polite?.message}
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
                {...ids.set(ids.post.form.btn.submit)}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (props.mode === "edit") {
                    props.onEditFinish();
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
            {...ids.set(ids.post.form.btn.submit)}
          >
            Post
          </Button>
        </Show>
      </Stack>
    </form>
  );
}

async function commentCreate(input: { parentId: ID; content_polite: string }) {
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
        visibility: Visibility.Public,
      },
    },
  );
}

async function commentUpdate(input: { id: ID; content_polite: string }) {
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
        visibility: Visibility.Public,
      },
    },
  );
}
