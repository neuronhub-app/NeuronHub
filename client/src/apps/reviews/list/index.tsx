import { RatingBars } from "@/apps/reviews/list/RatingBars";
import { ToolTags } from "@/apps/reviews/list/ToolTag";
import { UsageStatusBlock } from "@/apps/reviews/list/UsageStatus";
import { VoteButtons } from "@/apps/reviews/list/VoteButtons";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { graphql } from "@/gql-tada";
import {
  For,
  HStack,
  Heading,
  Icon,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { marked } from "marked";
import { FaPlus } from "react-icons/fa6";
import { useQuery } from "urql";

export function ReviewList() {
  const [{ data, error, fetching }] = useQuery({ query: ReviewListDoc });

  return (
    <Stack gap="gap.lg">
      <HStack justify="space-between">
        <Heading size="2xl">Reviews</Heading>
        <Button size="sm" variant="subtle">
          <Icon boxSize={3}>
            <FaPlus />
          </Icon>
          Create
        </Button>
      </HStack>

      {fetching && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <Stack gap="gap.xl">
        <For
          each={data?.tool_reviews}
          fallback={<Heading>No reviews yet</Heading>}
        >
          {review => (
            <HStack key={review.id} gap="gap.lg" align="flex-start">
              <VoteButtons />

              <Stack gap="gap.sm">
                <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
                  {review.tool.name}
                </Heading>

                <Show when={review.title}>
                  <Text fontWeight="bold" color="fg.muted">
                    {review.title}
                  </Text>
                </Show>

                <HStack gap="gap.xl">
                  <RatingBars
                    rating={review.rating}
                    type="rating"
                    color="fg.secondary"
                  />
                  <RatingBars
                    rating={review.importance}
                    type="importance"
                    color="fg.secondary"
                  />
                  <UsageStatusBlock
                    status={review.usage_status}
                    color="fg.secondary"
                  />
                </HStack>

                <Show when={review.content}>
                  <Prose
                    // biome-ignore lint/security/noDangerouslySetInnerHtml:
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(review.content),
                    }}
                    size="md"
                  />
                </Show>
                <Show when={review.content_pros}>
                  <Prose
                    // biome-ignore lint/security/noDangerouslySetInnerHtml:
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(review.content_pros),
                    }}
                    size="md"
                    variant="pros"
                  />
                </Show>
                <Show when={review.content_cons}>
                  <Prose
                    // biome-ignore lint/security/noDangerouslySetInnerHtml:
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(review.content_cons),
                    }}
                    size="md"
                    variant="cons"
                  />
                </Show>

                <ToolTags tags={review.tool.tags} />
              </Stack>
            </HStack>
          )}
        </For>
      </Stack>
    </Stack>
  );
}

export const ReviewListDoc = graphql(`
  query ReviewList {
    tool_reviews {
      tool {
        id
        name
        tags {
          id
          name
          description
          is_important
          tag_parent {
            id
            name
          }
          author {
            id
            name
          }
          votes {
            id
            author {
              id
              name
            }
            is_vote_positive
          }
        }
      }
      id
      title
      content
      content_pros
      content_cons
      importance
      is_private
      is_review_later
      usage_status
      rating
      source
    }
  }
`);
type ReviewListResult = ResultOf<typeof ReviewListDoc>["tool_reviews"];
export type ReviewTag = ReviewListResult[number]["tool"]["tags"][number];
export type UsageStatus = ReviewListResult[number]["usage_status"];
