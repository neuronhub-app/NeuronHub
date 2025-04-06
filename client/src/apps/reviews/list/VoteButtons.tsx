import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

export function VoteButtons() {
  return (
    <Stack align="center" color="slate.muted">
      <VoteButton isVotePositive={true} />
      <Flex>0</Flex>
      <VoteButton isVotePositive={false} />
    </Stack>
  );
}

function VoteButton(props: { isVotePositive: boolean }) {
  return (
    <IconButton
      aria-label={props.isVotePositive ? "Upvote" : "Downvote"}
      variant="ghost"
      borderRadius="lg"
      size="xs"
      colorPalette="slate"
      color="slate.300"
      _hover={{
        color: "slate.muted",
      }}
    >
      {props.isVotePositive ? <FaChevronUp /> : <FaChevronDown />}
    </IconButton>
  );
}
