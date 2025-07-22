import { Button, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { useCommentDraft } from "@/hooks/useCommentDraft";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000, "Comment is too long"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentCreateFormProps {
  parentId: string;
  onSubmit: (data: CommentFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CommentCreateForm({ parentId, onSubmit, isLoading }: CommentCreateFormProps) {
  const { draft, updateDraft, clearDraft } = useCommentDraft(parentId);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: draft,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const content = watch("content");

  // Update draft when content changes
  React.useEffect(() => {
    updateDraft(content ?? "");
  }, [content, updateDraft]);

  const handleFormSubmit = async (data: CommentFormData) => {
    await onSubmit(data);
    reset();
    clearDraft();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack gap={4}>
        <FormChakraTextarea
          field={{ name: "content", control: form.control }}
          placeholder="Write a comment..."
          errorText={errors.content?.message}
        />
        <Button type="submit" colorScheme="blue" loading={isLoading} alignSelf="flex-start">
          Post Comment
        </Button>
      </Stack>
    </form>
  );
}
