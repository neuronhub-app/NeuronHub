import type { Route } from "@/../.react-router/types/src/apps/reviews/detail/+types/index";
import { ReviewCard } from "@/apps/reviews/components/ReviewCard";
import { ReviewFragment } from "@/apps/reviews/graphqlFragments";
import { graphql } from "@/gql-tada";
import { datetime } from "@/utils/date-fns";
import { For, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "urql";

export default function ReviewDetail(props: Route.ComponentProps) {
  const [{ data, error, fetching }] = useQuery({
    query: ReviewDetailDoc,
    variables: { id: props.params.id },
  });

  return (
    <Stack>
      <Heading size="2xl">Review</Heading>
      {fetching && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {data?.tool_review && (
        <Stack gap="gap.xl">
          <ReviewCard review={data!.tool_review} />

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

export const ReviewDetailDoc = graphql(
  `
  query ReviewDetail($id: ID!) {
    tool_review(id: $id) {
      ...ToolReview,
      comments {
        id
        author {
          id
          username
          avatar {
            url
          }
        }
        created_at
        parent {
          id
        }
        content
        visibility
      }
    }
  }
`,
  [ReviewFragment],
);
