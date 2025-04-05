import type { UsageStatus } from "@/apps/reviews/list/index";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { PiPulse } from "react-icons/pi";

export function UsageStatusBlock(props: { status: UsageStatus | null }) {
  if (!props.status) {
    return null;
  }
  const statusLabel = statuses[props.status];
  return (
    <Flex align="center" gap={1}>
      <Icon
        boxSize={4.5}
        p={1}
        bg="slate.muted"
        color="white"
        borderRadius="sm"
      >
        <PiPulse />
      </Icon>
      <Text>{statusLabel}</Text>
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
