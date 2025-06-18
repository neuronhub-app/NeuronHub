import { For, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { CombinedError } from "urql";
import { PostCard } from "@/components/posts/PostCard";
import type { PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { datetime } from "@/utils/date-fns";

export function PostDetail(props: {
  title: string;
  post: PostDetailFragmentType | PostReviewDetailFragmentType | undefined;
  isLoading: boolean;
  error?: CombinedError;
  children?: ReactNode;
}) {
  return (
    <Stack>
      <Heading size="2xl">{props.title}</Heading>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {props.post && (
        <Stack gap="gap.xl">
          <PostCard post={props.post} />

          <For each={props.post.comments}>
            {comment => (
              <Stack key={comment.id} gap="gap.sm">
                <HStack justify="space-between">
                  <Heading size="lg">{comment.author.username}</Heading>
                  <Text color="fg.subtle" fontSize="sm">
                    {datetime.relative(comment.created_at)}
                  </Text>
                </HStack>
                <p>{comment.content}</p>
              </Stack>
            )}
          </For>
        </Stack>
      )}
    </Stack>
  );
}
