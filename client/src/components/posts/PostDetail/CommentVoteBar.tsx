import { HStack, Icon, IconButton } from "@chakra-ui/react";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import { usePostVoting } from "@/components/posts/usePostVoting";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";

export function CommentVoteBar(props: { comment: { id: ID; votes: PostCommentType["votes"] } }) {
  const voting = usePostVoting({ postId: props.comment.id, votes: props.comment.votes });

  return (
    <HStack color="slate.muted" gap={0}>
      <VoteButton isPositive={true} voting={voting} />

      {/*<Text fontSize="sm" minW={4} textAlign="center">*/}
      {/*  {voting.sum}*/}
      {/*</Text>*/}

      <VoteButton isPositive={false} voting={voting} />
    </HStack>
  );
}

function VoteButton(props: { isPositive: boolean; voting: ReturnType<typeof usePostVoting> }) {
  const isPositive = props.isPositive;
  const isChecked = isPositive === props.voting.isVotePositive;

  const colorLight = "darkAlpha.700";
  const colorDark = "whiteAlpha.300";
  const color = {
    checked: isPositive
      ? { _light: "green.500", _dark: "green.500" }
      : { _light: "red.400", _dark: "red.500" },
    unchecked: { _light: colorLight, _dark: colorDark },
  };

  return (
    <IconButton
      variant="subtle-ghost-v2" // todo refac-name: variant=vote-button, and rename "checked" to "upvoted"? or clarify it's a checkbox-like input
      size="2xs"
      data-state={isChecked ? "checked" : "unchecked"} // used in testing
      loading={isPositive ? props.voting.isLoadingUpvote : props.voting.isLoadingDownvote}
      onClick={() => props.voting.vote({ isPositive })}
      aria-label={`${isPositive ? "Upvote" : "Downvote"} comment`}
      {...ids.set(isPositive ? ids.comment.vote.up : ids.comment.vote.down)}
      color={isChecked ? color.checked : color.unchecked}
      bg="bg.transparent"
      _hover={{ bg: { _light: "whiteAlpha.200", _dark: "whiteAlpha.200" } }}
    >
      <Icon boxSize="5" mt={isPositive ? "-1px" : "1px"}>
        {isPositive ? <BsCaretUpFill /> : <BsCaretDownFill />}
      </Icon>
    </IconButton>
  );
}
