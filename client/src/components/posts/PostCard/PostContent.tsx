import { Stack } from "@chakra-ui/react";
import type { PostContentField, PostListItemType } from "@/components/posts/ListContainer";
import { Prose } from "@/components/ui/prose";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { markedConfigured } from "@/utils/marked-configured";

// todo refac-name: PostCardContent
export function PostContent(props: { post: PostListItemType }) {
  const fields: Array<{ name: PostContentField; label: string; id: string; value: string }> = [];

  if (props.post.content_direct) {
    fields.push({
      name: "content_direct",
      label: "Direct",
      id: ids.post.card.content_direct,
      value: props.post.content_direct,
    });
  }
  if (props.post.content_rant) {
    fields.push({
      name: "content_rant",
      label: "Rant",
      id: ids.post.card.content_rant,
      value: props.post.content_rant,
    });
  }
  if (props.post.content_polite) {
    fields.push({
      name: "content_polite",
      label: "Polite",
      id: ids.post.card.content_polite,
      value: props.post.content_polite,
    });
  }

  if (fields.length === 0) {
    return null;
  }

  const style = {
    mt: -1,
    maxW: "3xl",
    size: "sm",
  } as const;

  if (fields.length === 1) {
    const field = fields[0];

    const prose = (
      <Prose
        // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
        dangerouslySetInnerHTML={{
          __html: getAlgoliaContentHTML(props.post, field.name, field.value),
        }}
        {...style}
        {...ids.set(field.id)}
      />
    );
    if (field.name === "content_polite") {
      return prose;
    }
    return (
      <>
        <Tooltip content="Not a standard politically-correct post, the author decides who can view it">
          <Tag w="fit-content" size="lg">
            {field.label}
          </Tag>
        </Tooltip>
        {prose}
      </>
    );
  }

  // Multiple content fields - show all with tags
  return (
    <Stack gap="gap.md">
      {fields.map(field => (
        <Stack key={field.name} gap="gap.xs">
          <Tooltip
            content={
              field.name === "content_polite"
                ? "Standard politically-correct content"
                : "Not a standard politically-correct post, the author decides who can view it"
            }
          >
            <Tag w="fit-content" size="lg">
              {field.label}
            </Tag>
          </Tooltip>
          <Prose
            // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
            dangerouslySetInnerHTML={{
              __html: getAlgoliaContentHTML(props.post, field.name, field.value),
            }}
            {...style}
            {...ids.set(field.id)}
          />
        </Stack>
      ))}
    </Stack>
  );
}

function getAlgoliaContentHTML(post: PostListItemType, field: PostContentField, value: string) {
  if (hasAlgoliaHighlight(post) && post._highlightResult[field]?.matchedWords.length > 0) {
    return markedConfigured.parse(post._highlightResult[field].value);
  }
  return markedConfigured.parse(value);
}

function hasAlgoliaHighlight(post: PostListItemType): post is PostListItemAlgolia {
  return "_highlightResult" in post;
}

type PostListItemAlgolia = PostListItemType & {
  _highlightResult: Record<string, { value: string; matchedWords: string[] }>;
};
