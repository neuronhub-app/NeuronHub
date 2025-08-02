import toast from "react-hot-toast";
import { strs } from "@/apps/posts/detail/PostDetail";
import { createPostComment } from "@/apps/posts/services/createPostComment";

export async function handleCommentSubmit(parentId: string, content: string): Promise<void> {
  try {
    await createPostComment({ parentId, content });
    toast.success(strs.createdComment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to post comment: ${errorMessage}`);
  }
}
