import type { ReviewType } from "@/apps/reviews/list";
import { Tooltip } from "@/components/ui/tooltip";
import { datetime } from "@/utils/date-fns";
import { type JsxStyleProps, Text } from "@chakra-ui/react";

export function ReviewDatetime(props: { review: ReviewType; style?: JsxStyleProps }) {
  return (
    <Tooltip
      content={datetime.full(props.review.reviewed_at)}
      closeOnClick={false}
      closeOnPointerDown={false}
    >
      <Text color="fg.subtle" fontSize="sm" w="fit-content" {...(props.style ?? {})}>
        {datetime.relative(props.review.reviewed_at)}
      </Text>
    </Tooltip>
  );
}
