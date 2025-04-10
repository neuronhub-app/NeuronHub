import { RatingBars } from "@/apps/reviews/list/RatingBars";
import { ReviewAuthor } from "@/apps/reviews/list/ReviewAuthor";
import { ReviewButtons } from "@/apps/reviews/list/ReviewButtons";
import { ReviewButtonsVote } from "@/apps/reviews/list/ReviewButtonsVote";
import { ReviewDatetime } from "@/apps/reviews/list/ReviewDatetime";
import { ReviewListSidebar } from "@/apps/reviews/list/ReviewListSidebar";
import { ToolTags } from "@/apps/reviews/list/ToolTag";
import { UsageStatusBlock } from "@/apps/reviews/list/UsageStatus";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { graphql } from "@/gql-tada";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";
import { Flex, For, HStack, Heading, Icon, Show, Stack, Text } from "@chakra-ui/react";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { marked } from "marked";
import { FaPlus } from "react-icons/fa6";
import { NavLink } from "react-router";
import { useQuery } from "urql";

export default function ReviewListRoute() {
  return <ReviewList />;
}

function ReviewList() {
  const [{ data, error, fetching }] = useQuery({ query: ReviewListDoc });

  return (
    <Stack gap="gap.lg">
      <HStack justify="space-between">
        <Heading size="2xl">Reviews</Heading>

        <NavLink to="/reviews/create">
          <Button size="md" variant="subtle">
            <Icon boxSize={3}>
              <FaPlus />
            </Icon>
            Create
          </Button>
        </NavLink>
      </HStack>

      {fetching && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <Flex flex="1" pos="relative" gap="gap.xl">
        <Stack gap="gap.xl">
          <For each={data?.tool_reviews} fallback={<Heading>No reviews yet</Heading>}>
            {review => (
              <HStack key={review.id} gap="gap.md" align="flex-start">
                <Stack>
                  <ReviewButtonsVote review={review} />
                  <ReviewButtons review={review} />
                </Stack>

                <Stack
                  w="full"
                  gap="gap.md"
                  bg="bg.light"
                  p="gap.md"
                  borderRadius="lg"
                  {...getOutlineContrastStyle({ variant: "subtle" })}
                >
                  <Stack gap="gap.sm">
                    <ReviewDatetime review={review} style={{ lineHeight: 1 }} />
                    <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
                      {review.tool.name}
                    </Heading>

                    <Show when={review.title}>
                      <Text fontWeight="bold" color="fg.muted">
                        {review.title}
                      </Text>
                    </Show>

                    <HStack gap="gap.lg">
                      <RatingBars rating={review.rating} type="rating" color="fg.secondary" />
                      <RatingBars
                        rating={review.importance}
                        type="importance"
                        color="fg.secondary"
                      />
                      <RatingBars
                        rating={review.experience_hours}
                        type="experience"
                        color="fg.secondary"
                        boxSize={6}
                      />
                      <UsageStatusBlock status={review.usage_status} color="fg.secondary" />
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
                  </Stack>

                  <ToolTags tags={review.tool.tags} />
                  <ReviewAuthor author={review.author} />
                </Stack>
              </HStack>
            )}
          </For>
        </Stack>

        <ReviewListSidebar />
      </Flex>
    </Stack>
  );
}

export const ReviewListDoc = graphql(`
  query ReviewList {
    tool_reviews {
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
      reviewed_at
      experience_hours
      author {
        id
        name
        avatar {
          url
        }
      }
      votes {
        id
        is_vote_positive
      }
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
    }
  }
`);

type ReviewListType = ResultOf<typeof ReviewListDoc>["tool_reviews"];
export type ReviewType = ReviewListType[number];
export type ReviewTagType = ReviewType["tool"]["tags"][number];
