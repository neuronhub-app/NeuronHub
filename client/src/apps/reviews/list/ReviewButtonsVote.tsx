import { Flex, IconButton, Stack } from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

export function ReviewButtonsVote() {
  return (
    <Stack align="center" color="slate.muted">
      <ReviewVoteButton isVotePositive={true} />
      <Flex>0</Flex>
      <ReviewVoteButton isVotePositive={false} />
    </Stack>
  );
}

function ReviewVoteButton(props: { isVotePositive: boolean }) {
  return (
    <IconButton
      aria-label={props.isVotePositive ? "Upvote" : "Downvote"}
      variant="subtle-ghost"
      borderRadius="lg"
      size="sm"
    >
      {props.isVotePositive ? <FaChevronUp /> : <FaChevronDown />}
    </IconButton>
  );
}
