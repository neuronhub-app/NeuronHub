import { Icon, type JsxStyleProps, Tag, Wrap } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { BiChip, BiLogoDjango } from "react-icons/bi";
import { DiOpensource } from "react-icons/di";
import { FaApple, FaCode, FaLinux, FaPython, FaTerminal } from "react-icons/fa6";
import { GoLaw } from "react-icons/go";
import { HiOutlineServerStack } from "react-icons/hi2";
import { PiNetwork } from "react-icons/pi";
import { SiKotlin } from "react-icons/si";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

// todo !! if author sets is_vote_positive - put it before `is_important`
// todo !! after finding what tag is_important, make sure they're still sorted by votes
// todo !! add count for is_vote_positive=false
export function ToolTags(props: { tags: PostTagFragmentType[]; postId: ID }) {
  props.tags.sort((a, b) => {
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

  const tagsChildrenOnly = props.tags.filter(tag => tag.tag_children?.length === 0);
  return (
    <Wrap>
      {tagsChildrenOnly.map(tag => (
        <ToolTag key={tag.id} tag={tag} postId={props.postId} />
      ))}
    </Wrap>
  );
}

function ToolTag(props: { tag: PostTagFragmentType; postId: ID }) {
  let votesSum = 0;
  const tagVotes = props.tag.votes.filter(vote => vote.post.id === props.postId);
  for (const vote of tagVotes) {
    votesSum += vote.is_vote_positive ? 1 : -1;
  }
  let tagColor = "gray.500";
  if (votesSum > 0) {
    tagColor = "teal.700";
  } else if (votesSum < 0) {
    tagColor = "orange.500";
  }

  const isVotedOrImportant = tagVotes.length > 0 || props.tag.is_important;
  const iconParams = isVotedOrImportant ? getTagIconParams(props.tag) : null;

  return (
    <Tag.Root
      key={props.tag.id}
      aria-label={props.tag.description}
      colorPalette="gray"
      variant="subtle"
      size="lg"
      {...getOutlineContrastStyle({ variant: "subtle" })}
      opacity={tagColor === "gray" ? 0.8 : 1}
      {...ids.set(ids.tool.tag.item)}
    >
      {iconParams && (
        <Tag.StartElement {...iconParams.props}>
          <Icon display="block">{<iconParams.icon />}</Icon>
        </Tag.StartElement>
      )}

      <Tag.Label>{props.tag.name}</Tag.Label>
    </Tag.Root>
  );
}

// todo !! detect all parents, not just +1 level
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

const iconParamsMap: {
  [key: string]: {
    icon: IconType;
    props?: JsxStyleProps;
  };
} = {
  License: { icon: GoLaw },
  Django: { icon: BiLogoDjango, props: { boxSize: 3.5 } },
  macOS: { icon: FaApple },
  Python: { icon: FaPython, props: { boxSize: 3.5 } },
  Kotlin: { icon: SiKotlin, props: { boxSize: 2.5 } },
  Linux: { icon: FaLinux, props: { boxSize: 3 } },
  get IDE() {
    return this["Dev Tool"];
  },
  AI: { icon: BiChip },
  Network: { icon: PiNetwork },
  "Self-host": { icon: HiOutlineServerStack },
  "Dev Tool": { icon: FaCode, props: { boxSize: 3.5 } },
  "Terminal emulator": { icon: FaTerminal, props: { boxSize: 3 } },
  get CLI() {
    return this["Terminal emulator"];
  },
  "Open source": { icon: DiOpensource },
};
