import { Button, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { handleCommentSubmit } from "@/components/posts/comments/handleCommentSubmit";
import { ids } from "@/e2e/ids";
import { useCommentDraft } from "@/hooks/useCommentDraft";

const schema = z.object({
  content: z.string().min(1).max(5000),
});

export function CommentCreateForm(props: { parentId: string }) {
  const draft = useCommentDraft(props.parentId);

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
        await handleCommentSubmit(props.parentId, data.content);
        form.reset();
        draft.clear();
      })}
    >
      <Stack gap={4}>
        <FormChakraTextarea
          field={{ name: "content", control: form.control }}
          placeholder="Write a comment..."
          errorText={form.formState.errors.content?.message}
          {...ids.set(ids.comment.form.contentTextarea)}
        />
        <Button
          type="submit"
          variant="subtle"
          size="sm"
          alignSelf="flex-start"
          {...ids.set(ids.comment.form.submitBtn)}
        >
          Post
        </Button>
      </Stack>
    </form>
  );
}
