import { ToolTags } from "@/apps/reviews/ToolTag";
import { Prose } from "@/components/ui/prose";
import { graphql } from "@/gql-tada";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { marked } from "marked";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { PiPulse } from "react-icons/pi";
import { useQuery } from "urql";

export function ReviewList() {
  const [{ data, error, fetching }] = useQuery({ query: ReviewListDoc });

  return (
    <div>
      <h1>Reviews</h1>
      {fetching && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <Stack gap="gap.xl">
        {data?.tool_reviews.map(review => (
          <HStack key={review.id} gap="gap.lg" align="flex-start">
            <Stack align="center" color="gray">
              <VoteButton isVotePositive={true} />
              <Flex>3</Flex>
              <VoteButton isVotePositive={false} />
            </Stack>

            <Stack>
              <Heading fontSize="md" lineHeight={1.6}>
                {review.title}
              </Heading>

              <HStack gap="gap.lg">
                <SectionalRating title="Rating" rating={review.rating} />
                <SectionalRating
                  title="Importance"
                  rating={review.importance}
                />
                <Flex align="center" gap={1}>
                  <Icon
                    boxSize={6}
                    p={1}
                    bg="gray.400"
                    color="white"
                    borderRadius="sm"
                  >
                    <PiPulse />
                  </Icon>
                  <Text>{review.usage_status}</Text>
                </Flex>
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
        ))}
      </Stack>
    </div>
  );
}

function VoteButton(props: { isVotePositive: boolean }) {
  return (
    <IconButton
      aria-label={props.isVotePositive ? "Upvote" : "Downvote"}
      variant="subtle"
      colorPalette="gray"
      borderRadius="lg"
      color="white"
      size="xs"
    >
      {props.isVotePositive ? <FaChevronUp /> : <FaChevronDown />}
    </IconButton>
  );
}

/**
 * 5 section rating, with long squares filled by rating
 */
function SectionalRating(props: { title: string; rating: number | unknown }) {
  const width = 4;
  const height = 4;
  const borderRadius = "sm";
  return (
    <HStack>
      <Text fontSize="sm">{props.title}</Text>
      <HStack gap="4px">
        <Box w={width} h={height} bg="bg.light" borderRadius={borderRadius} />
        <Box w={width} h={height} bg="bg.light" borderRadius={borderRadius} />
        <Box w={width} h={height} bg="bg.light" borderRadius={borderRadius} />
        <Box w={width} h={height} bg="bg.light" borderRadius={borderRadius} />
        <Box w={width} h={height} bg="bg.light" borderRadius={borderRadius} />
      </HStack>
    </HStack>
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
type ReviewList = ResultOf<typeof ReviewListDoc>["tool_reviews"];
export type ReviewTag = ReviewList[number]["tool"]["tags"][number];
