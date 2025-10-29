import { For, Heading, HStack, Show, Stack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { PostImportRefreshButton } from "@/components/posts/PostDetail/PostImportRefreshButton";
import type { PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { PostTypeEnum } from "~/graphql/enums";

export function PostDetail(props: {
  title: string;
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const highlighter = useHighlighter({ comments: props.post?.comments });

  const idExternal = props.post?.posts_source?.[0]?.id_external;

  return (
    <Stack>
      <HStack justify="space-between" align="center">
        <Heading size="2xl">{props.title}</Heading>
        <Show when={idExternal}>
          <PostImportRefreshButton idExternal={idExternal!} />
        </Show>
      </HStack>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {props.post && (
        <Stack gap="gap.xl">
          <PostCard post={props.post} />

          <Stack gap="gap.lg">
            <Heading size="lg">Comments</Heading>

            <VStack px={0} align="flex-start" gap="gap.md">
              <For each={props.post.comments}>
                {comment =>
                  // only render top-level comments
                  comment.parent?.type !== PostTypeEnum.Comment ? (
                    <CommentThread
                      key={comment.id}
                      comment={highlighter.highlight(comment)}
                      post={props.post!}
                    />
                  ) : null
                }
              </For>
            </VStack>

            <Show when={user}>
              <CommentForm mode="create" parentId={props.post.id} />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
