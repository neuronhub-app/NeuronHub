import { Flex, Icon, type JsxStyleProps, Text } from "@chakra-ui/react";
import { BiPulse } from "react-icons/bi";
import type { PostReviewFragmentType } from "@/graphql/fragments/reviews";

export function UsageStatusBlock(props: {
  status: PostReviewFragmentType["review_usage_status"] | null;
  color: JsxStyleProps["color"];
}) {
  if (!props.status) {
    return null;
  }
  const statusLabel = statuses[props.status];
  return (
    <Flex align="center" gap={1}>
      <Icon boxSize={6} color={props.color}>
        <BiPulse />
      </Icon>
      <Text fontSize="sm" color="fg.muted" mb="1px">
        {statusLabel}
      </Text>
    </Flex>
  );
}

const statuses: Record<NonNullable<PostReviewFragmentType["review_usage_status"]>, string> = {
  USING: "Using",
  WANT_TO_USE: "Want to use",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not interested",
  USED: "Used",
};
