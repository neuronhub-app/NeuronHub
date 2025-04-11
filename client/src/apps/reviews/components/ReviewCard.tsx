import { RatingBars } from "@/apps/reviews/components/RatingBars";
import { ReviewDatetime } from "@/apps/reviews/components/ReviewDatetime";
import { UsageStatusBlock } from "@/apps/reviews/components/UsageStatus";
import type { ReviewType } from "@/apps/reviews/list";
import { Prose } from "@/components/ui/prose";
import { HStack, Heading, Show, Stack, Text } from "@chakra-ui/react";
import { marked } from "marked";
import { NavLink } from "react-router";

export function ReviewCard(props: { review: ReviewType }) {
  const review = props.review;
  return (
    <Stack gap="gap.sm">
      <ReviewDatetime review={review} style={{ lineHeight: 1 }} />

      <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
        {review.tool.name}
      </Heading>

      <Show when={review.title}>
        <NavLink to={`/reviews/${review.id}`}>
          <Text fontWeight="bold" color="fg.muted">
            {review.title}
          </Text>
        </NavLink>
      </Show>

      <HStack gap="gap.lg">
        <RatingBars rating={review.rating} type="rating" color="fg.secondary" />
        <RatingBars rating={review.importance} type="importance" color="fg.secondary" />
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
  );
}
