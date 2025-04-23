import type { Route } from "@/../.react-router/types/src/apps/reviews/detail/+types/index";
import { PostCard } from "@/components/posts/PostCard";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { datetime } from "@/utils/date-fns";
import { For, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "urql";

export default function ReviewDetail(props: Route.ComponentProps) {
  const [{ data, error, fetching }] = useQuery({
    query: PostReviewDetailDoc,
    variables: { id: props.params.id },
  });

  return (
    <Stack>
      <Heading size="2xl">Review</Heading>
      {fetching && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data?.tool_review && (
        <Stack gap="gap.xl">
          <PostCard post={data!.tool_review} />

          <For each={data.tool_review.comments}>
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

const PostReviewDetailDoc = graphql(
  `
    query PostReviewDetail($id: ID!) {
      tool_review(id: $id) {
        ...PostReviewFragment
      }
    }
  `,
  [PostReviewFragment],
);
