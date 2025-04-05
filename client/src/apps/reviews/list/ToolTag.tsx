import type { ReviewTag } from "@/apps/reviews/list/index";
import { Icon, Tag, Wrap } from "@chakra-ui/react";
// @ts-ignore
import type { SystemProperties } from "@chakra-ui/react/dist/types/styled-system/generated/system.gen";
import type { IconType } from "react-icons";
import { BiLogoDjango } from "react-icons/bi";
import { DiOpensource } from "react-icons/di";
import {
  FaApple,
  FaCode,
  FaLinux,
  FaPython,
  FaTerminal,
} from "react-icons/fa6";
import { GoLaw } from "react-icons/go";
import { SiKotlin } from "react-icons/si";

export function ToolTags(props: { tags: ReviewTag[] }) {
  props.tags.sort((a, b) => {
    // First sort by is_important
    if (a.is_important !== b.is_important) {
      return a.is_important ? -1 : 1;
    }

    // Then sort by the number of positive votes
    const aPositiveVotes = a.votes.filter(vote => vote.is_vote_positive).length;
    const bPositiveVotes = b.votes.filter(vote => vote.is_vote_positive).length;

    return bPositiveVotes - aPositiveVotes; // Higher positive votes first
  });

  return (
    <Wrap>
      {props.tags.map(tag => (
        <ToolTag key={tag.id} tag={tag} />
      ))}
    </Wrap>
  );
}

export function ToolTag(props: { tag: ReviewTag }) {
  const iconInfo = getToolIconInfo(props.tag);

  let votesSum = 0;
  for (const vote of props.tag.votes) {
    votesSum += vote.is_vote_positive ? 1 : -1;
  }
  let tagColor = "gray";
  if (votesSum > 0) {
    tagColor = "green";
  } else if (votesSum < 0) {
    tagColor = "red";
  }

  return (
    <Tag.Root
      key={props.tag.id}
      aria-label={props.tag.description}
      colorPalette={tagColor}
      variant="subtle"
      opacity={0.7}
    >
      {iconInfo && (
        <Tag.StartElement {...iconInfo.props}>
          <Icon display="block">{<iconInfo.icon />}</Icon>
        </Tag.StartElement>
      )}

      <Tag.Label>{props.tag.name}</Tag.Label>
    </Tag.Root>
  );
}

function getToolIconInfo(tag: ReviewTag) {
  if (!tag.is_important) {
    return null;
  }

  const iconInfo = icons[tag.name as keyof typeof icons];
  if (tag.tag_parent) {
    const iconInfoParent = icons[tag.tag_parent.name as keyof typeof icons];
    if (iconInfoParent) {
      return iconInfoParent;
    }
  }
  return iconInfo;
}

const icons: {
  [key: string]: {
    icon: IconType;
    props?: SystemProperties;
  };
} = {
  License: { icon: GoLaw },
  Django: { icon: BiLogoDjango },
  macOS: { icon: FaApple },
  Python: { icon: FaPython },
  Kotlin: { icon: SiKotlin, props: { boxSize: 2.5 } },
  Linux: { icon: FaLinux, props: { boxSize: 2.5 } },
  IDE: { icon: FaCode },
  "Terminal emulator": { icon: FaTerminal, props: { boxSize: 3 } },
  "Open source": { icon: DiOpensource },
};
