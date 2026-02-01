import { Heading, type JsxStyleProps } from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { Highlight } from "react-instantsearch";

import type { PostListItemType } from "@/components/posts/ListContainer";

export function PostHeading(props: {
  post: PostListItemType;
  fontSize?: JsxStyleProps["fontSize"];
  fontWeight?: JsxStyleProps["fontWeight"];
}) {
  const isAlgoliaSearchResult = "_highlightResult" in props.post;

  return (
    <Heading
      fontSize={props.fontSize ?? "lg"}
      fontWeight={props.fontWeight ?? "semibold"}
      display="flex"
      gap="gap.sm"
      alignItems="center"
    >
      {isAlgoliaSearchResult ? (
        <Highlight attribute="title" hit={props.post as unknown as Hit<BaseHit>} />
      ) : (
        props.post.title || props.post.type
      )}
    </Heading>
  );
}
