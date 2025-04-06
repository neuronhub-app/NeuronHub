import type { UsageStatus } from "@/apps/reviews/list/index";
import { Flex, Icon, Text } from "@chakra-ui/react";
// @ts-ignore
import type { SystemProperties } from "@chakra-ui/react/dist/types/styled-system/generated/system.gen";
import { BiPulse } from "react-icons/bi";

export function UsageStatusBlock(props: {
  status: UsageStatus | null;
  color: SystemProperties["color"];
}) {
  if (!props.status) {
    return null;
  }
  const statusLabel = statuses[props.status];
  return (
    <Flex align="center" gap={1}>
      <Icon boxSize={7} color={props.color}>
        <BiPulse />
      </Icon>
      <Text fontSize="sm" color="fg.muted" mb="1px">
        {statusLabel}
      </Text>
    </Flex>
  );
}

const statuses: Record<NonNullable<UsageStatus>, string> = {
  USING: "Using",
  WANT_TO_USE: "Want to use",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not interested",
  USED: "Used",
};
