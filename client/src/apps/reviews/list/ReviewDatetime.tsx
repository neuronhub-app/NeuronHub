import type { ReviewType } from "@/apps/reviews/list";
import { Tooltip } from "@/components/ui/tooltip";
import { type JsxStyleProps, Text } from "@chakra-ui/react";
import { differenceInDays, format, formatDistanceToNowStrict, isSameYear } from "date-fns";

export function ReviewDatetime(props: { review: ReviewType; style?: JsxStyleProps }) {
  const reviewedAt = new Date(String(props.review.reviewed_at));
  let reviewedAtStr = `${formatDistanceToNowStrict(reviewedAt)} ago`;

  const daysAgo = differenceInDays(new Date(), reviewedAt);
  const isMoreThan30Days = 30 < daysAgo;

  if (isMoreThan30Days) {
    if (isSameYear(reviewedAt, new Date())) {
      reviewedAtStr = format(reviewedAt, "MMMM d, h:mmaaaaa'm");
    } else {
      reviewedAtStr = format(reviewedAt, "MMMM d, yyyy h:mmaaaaa'm");
    }
  }

  return (
    <Tooltip
      content={format(reviewedAt, "MMMM d, yyyy h:mmaaaaa'm")}
      closeOnClick={false}
      closeOnPointerDown={false}
    >
      <Text color="fg.subtle" fontSize="sm" w="fit-content" {...(props.style ?? {})}>
        {reviewedAtStr}
      </Text>
    </Tooltip>
  );
}
