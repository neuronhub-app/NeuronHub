import { Tag, Wrap } from "@chakra-ui/react";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { ids } from "@/e2e/ids";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

export function ReviewTags(props: { tags: PostTagFragmentType[]; reviewAuthorId?: string }) {
  const reviewTags = props.tags.filter(tag => {
    if (!tag.is_review_tag) return false;

    if (props.reviewAuthorId) {
      return tag.votes.some(vote => vote.author.id === props.reviewAuthorId);
    }

    return true;
  });

  reviewTags.sort((a, b) => {
    if (a.is_important !== b.is_important) {
      return a.is_important ? -1 : 1;
    }

    const aPositiveVotes = a.votes.filter(vote => vote.is_vote_positive).length;
    const bPositiveVotes = b.votes.filter(vote => vote.is_vote_positive).length;

    return bPositiveVotes - aPositiveVotes;
  });

  if (reviewTags.length === 0) {
    return null;
  }

  return (
    <Wrap {...ids.set(ids.review.tag.container)}>
      {reviewTags.map(tag => (
        <ReviewTagElem key={tag.id} tag={tag} reviewAuthorId={props.reviewAuthorId} />
      ))}
    </Wrap>
  );
}

function ReviewTagElem(props: { tag: PostTagFragmentType; reviewAuthorId?: string }) {
  let authorVote = null;

  if (props.reviewAuthorId) {
    authorVote = props.tag.votes.find(vote => vote.author.id === props.reviewAuthorId);
  }

  const colorPalette = authorVote?.is_vote_positive ? "green" : authorVote ? "red" : "gray";

  return (
    <Tag.Root
      key={props.tag.id}
      aria-label={props.tag.description}
      colorPalette={colorPalette}
      variant="subtle"
      size="lg"
      {...getOutlineContrastStyle({ variant: "subtle" })}
      opacity={0.8}
      fontWeight={props.tag.is_important ? "bold" : "normal"}
      {...ids.set(ids.review.tag.item)}
      data-is-important={props.tag.is_important}
    >
      <Tag.Label>{props.tag.label || props.tag.name}</Tag.Label>
      {authorVote && (
        <Tag.EndElement
          {...ids.set(
            authorVote.is_vote_positive
              ? ids.review.tag.authorVotePlus
              : ids.review.tag.authorVoteMinus,
          )}
        >
          {authorVote.is_vote_positive ? <HiPlus /> : <HiMinus />}
        </Tag.EndElement>
      )}
    </Tag.Root>
  );
}
