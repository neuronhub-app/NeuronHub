import { Button, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/react";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { strs } from "@/apps/posts/detail/PostDetail";
import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/graphql/mutateAndRefetch";
import { usePostCommentDraft } from "@/hooks/usePostCommentDraft";

const schema = z.object({
  content: z.string().min(1).max(5000),
});

export function CommentCreateForm(props: { parentId: string }) {
  const draft = usePostCommentDraft(props.parentId);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { content: draft.content },
  });

  const content = form.watch("content");
  React.useEffect(() => {
    draft.update(content ?? "");
  }, [content, draft.update]);

  return (
    <form
      onSubmit={form.handleSubmit(async data => {
        try {
          await createComment({ parentId: props.parentId, content: data.content });
          toast.success(strs.createdComment);
          form.reset();
          draft.clear();
        } catch (error) {
          captureException(error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to post comment: ${errorMessage}`);
        }
      })}
    >
      <Stack gap={4}>
        <FormChakraTextarea
          field={{ name: "content", control: form.control }}
          placeholder="Write a comment..."
          errorText={form.formState.errors.content?.message}
          {...ids.set(ids.comment.form.textarea)}
        />
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
      </Stack>
    </form>
  );
}

async function createComment(input: { parentId: string; content: string }) {
  return mutateAndRefetch(
    graphql(`
      mutation CreatePostComment($data: PostTypeInput!) {
        create_post_comment(data: $data) {
          id
          type
          content
          author {
            id
            username
          }
          parent {
            id
          }
          created_at
        }
      }
    `),
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
