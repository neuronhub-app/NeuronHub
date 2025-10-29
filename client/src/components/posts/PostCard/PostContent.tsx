import { Stack } from "@chakra-ui/react";
import type { PostContentField, PostListItemType } from "@/components/posts/ListContainer";
import { Prose } from "@/components/ui/prose";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { markedConfigured } from "@/utils/marked-configured";

// todo refac-name: PostCardContent
export function PostContent(props: { post: PostListItemType }) {
  const items: Array<{ field: PostContentField; label: string; id: string; content: string }> =
    [];

  if (props.post.content_polite) {
    items.push({
      field: "content_polite",
      label: "Polite",
      id: ids.post.card.content_polite,
      content: props.post.content_polite,
    });
  }
  if (props.post.content_direct) {
    items.push({
      field: "content_direct",
      label: "Direct",
      id: ids.post.card.content_direct,
      content: props.post.content_direct,
    });
  }
  if (props.post.content_rant) {
    items.push({
      field: "content_rant",
      label: "Rant",
      id: ids.post.card.content_rant,
      content: props.post.content_rant,
    });
  }

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    const item = items[0];

    const prose = (
      <Prose
        // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
        dangerouslySetInnerHTML={{ __html: markedConfigured.parse(item.content) }}
        size="md"
        mt={-1}
        {...ids.set(item.id)}
      />
    );
    if (item.field === "content_polite") {
      return prose;
    }
    return (
      <>
        <Tooltip content="Not a standard politically-correct post, the author decides who can view it">
          <Tag w="fit-content" size="lg">
            {item.label}
          </Tag>
        </Tooltip>
        {prose}
      </>
    );
  }

  // Multiple content fields - show all with tags
  return (
    <Stack gap="gap.md">
      {items.map(item => (
        <Stack key={item.field} gap="gap.xs">
          <Tooltip
            content={
              item.field === "content_polite"
                ? "Standard politically-correct content"
                : "Not a standard politically-correct post, the author decides who can view it"
            }
          >
            <Tag w="fit-content" size="lg">
              {item.label}
            </Tag>
          </Tooltip>
          <Prose
            // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
            dangerouslySetInnerHTML={{ __html: markedConfigured.parse(item.content) }}
            size="md"
            {...ids.set(item.id)}
          />
        </Stack>
      ))}
    </Stack>
  );
}
