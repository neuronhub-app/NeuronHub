import { Tag, Wrap } from "@chakra-ui/react";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import type { PostTagFragmentType } from "@/graphql/fragments/tags";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

export function ReviewTags(props: { tags: PostTagFragmentType[]; authorId: ID }) {
  const reviewTags = props.tags.filter(tag => tag.is_review_tag);

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
        <ReviewTagElem key={tag.id} tag={tag} authorId={props.authorId} />
      ))}
    </Wrap>
  );
}

function ReviewTagElem(props: { tag: PostTagFragmentType; authorId: ID }) {
  const authorVote = props.tag.votes.find(vote => vote.author?.id === props.authorId);
  return (
    <Tag.Root
      key={props.tag.id}
      aria-label={props.tag.description}
      colorPalette={authorVote?.is_vote_positive ? "green" : authorVote ? "red" : "gray"}
      variant="subtle"
      size="lg"
      opacity={0.8}
      fontWeight={props.tag.is_important ? "bold" : "normal"}
      {...getOutlineBleedingProps("muted")}
      {...ids.set(ids.review.tag.item)}
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
