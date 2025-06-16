import { Icon, type JsxStyleProps, Tag, Wrap } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { BiLogoDjango } from "react-icons/bi";
import { DiOpensource } from "react-icons/di";
import { FaApple, FaCode, FaLinux, FaPython, FaTerminal } from "react-icons/fa6";
import { GoLaw } from "react-icons/go";
import { SiKotlin } from "react-icons/si";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

export function ToolTags(props: { tags: PostTagFragmentType[] }) {
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
        <ToolTagElem key={tag.id} tag={tag} />
      ))}
    </Wrap>
  );
}

function ToolTagElem(props: { tag: PostTagFragmentType }) {
  const iconInfo = getToolIconInfo(props.tag);

  let votesSum = 0;
  for (const vote of props.tag.votes) {
    votesSum += vote.is_vote_positive ? 1 : -1;
  }
  let tagColor = "gray.500";
  if (votesSum > 0) {
    tagColor = "teal.700";
  } else if (votesSum < 0) {
    tagColor = "orange.500";
  }

  return (
    <Tag.Root
      key={props.tag.id}
      aria-label={props.tag.description}
      colorPalette="gray"
      variant="subtle"
      size="lg"
      {...getOutlineContrastStyle({ variant: "subtle" })}
      opacity={tagColor === "gray" ? 0.8 : 1}
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

function getToolIconInfo(tag: PostTagFragmentType) {
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
    props?: JsxStyleProps;
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
