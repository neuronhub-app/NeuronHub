import { ReviewCard } from "@/apps/reviews/components/ReviewCard";
import { ReviewFragment } from "@/apps/reviews/graphqlFragments";
import { ReviewAuthor } from "@/apps/reviews/list/ReviewAuthor";
import { ReviewButtons } from "@/apps/reviews/list/ReviewButtons";
import { ReviewButtonsVote } from "@/apps/reviews/list/ReviewButtonsVote";
import { ReviewListSidebar } from "@/apps/reviews/list/ReviewListSidebar";
import { ToolTags } from "@/apps/reviews/list/ToolTag";
import { Button } from "@/components/ui/button";
import { graphql } from "@/gql-tada";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";
import {
  Flex,
  For,
  HStack,
  Heading,
  Icon,
  IconButton,
  Link,
  Show,
  Stack,
} from "@chakra-ui/react";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { BsChatLeftTextFill } from "react-icons/bs";
import { FaGithub, FaPlus } from "react-icons/fa6";
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
                  <ReviewCard review={review} />

                  <ToolTags tags={review.tool.tags} />

                  <HStack justify="space-between">
                    <ReviewAuthor author={review.author} />

                    <HStack>
                      <Show when={review.source}>
                        <Link href={review.source}>Source</Link>
                      </Show>
                      <Show when={review.tool.github_url}>
                        <Link
                          href={`https://${review.tool.github_url}`}
                          color="fg.subtle"
                          variant="underline"
                        >
                          <Icon>
                            <FaGithub />
                          </Icon>
                          Github
                        </Link>
                      </Show>
                    </HStack>
                  </HStack>

                  <NavLink to={`/reviews/${review.id}`}>
                    <IconButton
                      variant="plain"
                      colorPalette="gray"
                      aria-label="Comments"
                      color="fg.subtle"
                    >
                      <BsChatLeftTextFill /> {review.comments.length}
                    </IconButton>
                  </NavLink>
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

export const ReviewListDoc = graphql(
  `
    query ReviewList {
      tool_reviews {
        ...ToolReview
        comments {
          id
        }
      }
    }
  `,
  [ReviewFragment],
);

type ReviewListType = ResultOf<typeof ReviewListDoc>["tool_reviews"];
export type ReviewType = ReviewListType[number];
export type ReviewTagType = ReviewType["tool"]["tags"][number];
