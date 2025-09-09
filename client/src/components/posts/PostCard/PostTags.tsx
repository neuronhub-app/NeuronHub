import { Icon, Tag, Wrap } from "@chakra-ui/react";
import { BiChip, BiLogoDjango } from "react-icons/bi";
import { DiOpensource } from "react-icons/di";
import { FaApple, FaCode, FaLinux, FaPython, FaTerminal } from "react-icons/fa6";
import { GoLaw } from "react-icons/go";
import { HiOutlineServerStack } from "react-icons/hi2";
import { MdOutlineThumbDown, MdOutlineThumbUp } from "react-icons/md";
import { PiNetwork } from "react-icons/pi";
import { SiKotlin } from "react-icons/si";
import { Tooltip } from "@/components/ui/tooltip";
import type { ID } from "@/gql-tada";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

// todo feat(UI): after tag.is_important, make ensure still sorted by votes
export function PostTags(props: {
  tags: PostTagFragmentType[];
  postId: ID;
  tagsExcluded?: ID[];
  isWrapChildren?: boolean;
}) {
  const isWrapChildren = props.isWrapChildren ?? true;

  const tagsFiltered = props.tagsExcluded
    ? props.tags.filter(tag => !props.tagsExcluded?.includes(tag.id))
    : props.tags;

  const tagsSorted = [...tagsFiltered].sort((a, b) => {
    // Secondly sort by votes
    const votesA = a.votes.filter(tag => tag.post.id === props.postId);
    const votesB = b.votes.filter(tag => tag.post.id === props.postId);

    const isVotedOrImportantA = votesA.length > 0 || a.is_important;
    const isVotedOrImportantB = votesB.length > 0 || b.is_important;
    if (isVotedOrImportantA !== isVotedOrImportantB) {
      return isVotedOrImportantA ? -1 : 1;
    }

    const votesPosA = votesA.filter(vote => vote.is_vote_positive).length;
    const votesPosB = votesB.filter(vote => vote.is_vote_positive).length;
    if (votesPosA !== votesPosB) {
      return votesPosB - votesPosA;
    }

    // First sort by is_important
    if (a.is_important !== b.is_important) {
      return a.is_important ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const tagsWithoutParent = tagsSorted
    .filter(tag => tag.tag_children?.length === 0)
    .map(tag => <PostTag key={tag.id} tag={tag} postId={props.postId} />);

  if (isWrapChildren) {
    return <Wrap>{tagsWithoutParent}</Wrap>;
  }
  return tagsWithoutParent;
}

// todo feat(UI): add vote count
export function PostTag(props: {
  tag: PostTagFragmentType;
  postId: ID;
  isUserOrAuthorVotedPositive?: boolean | null;
  voteTooltip?: string;
}) {
  let votesSum = 0;
  const tagVotes = props.tag.votes.filter(vote => vote.post.id === props.postId);
  for (const vote of tagVotes) {
    votesSum += vote.is_vote_positive ? 1 : -1;
  }

  const isUserOrAuthorVoted = props.isUserOrAuthorVotedPositive !== undefined;
  const isVotedOrImportant = props.tag.is_important || isUserOrAuthorVoted;
  const tagIconParams = isVotedOrImportant ? getTagIconParams(props.tag) : null;

  return (
    <Tag.Root
      key={props.tag.id}
      colorPalette="gray"
      variant="subtle"
      size="lg"
      {...getOutlineContrastStyle({ variant: "subtle" })}
      opacity={0.9}
      bg={{ _light: "bg.subtle" }}
    >
      {tagIconParams && (
        <Tag.StartElement {...tagIconParams.props}>
          <Icon display="flex">{<tagIconParams.icon />}</Icon>
        </Tag.StartElement>
      )}

      <Tag.Label>{props.tag.name}</Tag.Label>

      {isUserOrAuthorVoted && (
        // todo feat(UI): make icon Solid if both User+Author voted same; show User vote negative
        <Tooltip content={props.voteTooltip}>
          <Tag.EndElement boxSize={iconSize} pt="px" _hover={{ cursor: "help" }}>
            {props.isUserOrAuthorVotedPositive === false && (
              <Icon display="flex" color="red.600" aria-label="upvote">
                {<MdOutlineThumbDown />}
              </Icon>
            )}
            {props.isUserOrAuthorVotedPositive === true && (
              <Icon display="flex" color="blue.400" aria-label="downvote">
                {<MdOutlineThumbUp />}
              </Icon>
            )}
          </Tag.EndElement>
        </Tooltip>
      )}
    </Tag.Root>
  );
}

// todo !(tags) detect all parents, not just +1 level
function getTagIconParams(tag: PostTagFragmentType) {
  const iconParams = iconParamsMap[tag.name as keyof typeof iconParamsMap];
  if (tag.tag_parent) {
    const iconParamsParent = iconParamsMap[tag.tag_parent.name as keyof typeof iconParamsMap];
    if (iconParamsParent) {
      return iconParamsParent;
    }
  }
  return iconParams;
}

const iconSize = 3.5;

const iconParamsMap = {
  License: { icon: GoLaw, props: {} },
  Django: { icon: BiLogoDjango, props: { boxSize: iconSize } },
  macOS: { icon: FaApple, props: {} },
  Python: { icon: FaPython, props: { boxSize: iconSize } },
  Kotlin: { icon: SiKotlin, props: { boxSize: 2.5 } },
  Linux: { icon: FaLinux, props: { boxSize: iconSize - 0.5 } },
  get IDE() {
    return this["Dev Tool"];
  },
  AI: { icon: BiChip, props: {} },
  Network: { icon: PiNetwork, props: {} },
  "Self-host": { icon: HiOutlineServerStack, props: {} },
  "Dev Tool": { icon: FaCode, props: { boxSize: iconSize } },
  "Terminal emulator": { icon: FaTerminal, props: { boxSize: iconSize - 0.5 } },
  get CLI() {
    return this["Terminal emulator"];
  },
  "Open source": { icon: DiOpensource, props: {} },
  // todo prob(UI): fix for this tag
  get "Open Source Core"() {
    return this["Open source"];
  },
} as const;
