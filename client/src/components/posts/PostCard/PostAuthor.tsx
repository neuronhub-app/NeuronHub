import { Avatar, Flex, Popover, Portal, Text } from "@chakra-ui/react";
import type { PostListItemType } from "@/components/posts/ListContainer";
import type { PostCommentTree } from "@/components/posts/PostDetail";
import { Prose } from "@/components/ui/prose";
import { datetime } from "@/utils/date-fns";
import { markedConfigured } from "@/utils/marked-configured";

export function PostAuthor(props: {
  post: PostListItemType | PostCommentTree;
  isHideAvatar?: boolean;
}) {
  const isImportedAuthor = Boolean(props.post.post_source?.user_source);

  if (isImportedAuthor) {
    const author = props.post.post_source!.user_source!;

    return (
      <Popover.Root lazyMount unmountOnExit>
        <Popover.Trigger>
          <PostAuthorUsername post={props.post} isPopover isHideAvatar={props.isHideAvatar} />
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body>
                <Flex>
                  <Text fontWeight="bold">Created</Text>:{" "}
                  {datetime.relative(author.created_at_external)}
                </Flex>
                <Flex>
                  <Text fontWeight="bold">Karma</Text>:{" "}
                  {new Intl.NumberFormat().format(author.score)}
                </Flex>
                {author.about && (
                  <Prose
                    size="xs"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: imported
                    dangerouslySetInnerHTML={{ __html: markedConfigured.parse(author.about) }}
                  />
                )}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    );
  }
  return <PostAuthorUsername post={props.post} />;
}

function PostAuthorUsername(props: {
  post: PostListItemType | PostCommentTree;
  isPopover?: boolean;
  isHideAvatar?: boolean;
}) {
  const username = props.post.author?.username ?? props.post?.post_source?.user_source?.username;
  return (
    <Flex
      align="center"
      gap="gap.sm"
      _hover={props.isPopover ? { cursor: "pointer", textDecoration: "underline" } : {}}
    >
      {!props.isHideAvatar && (
        <Avatar.Root
          size="2xs"
          variant="subtle"
          colorPalette={getAvatarColorForUsername(username!)}
        >
          <Avatar.Fallback name={username} />
          <Avatar.Image
            src={props.post.author?.avatar?.url}
            filter="grayscale(0.4)"
            _hover={{
              filter: "grayscale(0)",
            }}
          />
        </Avatar.Root>
      )}
      <Text fontSize="sm" color="fg.muted">
        {username}
      </Text>
    </Flex>
  );
}

export function getAvatarColorForUsername(username: string) {
  const colorPalette = [
    "gray",
    "slate",
    "red",
    "pink",
    "purple",
    "sky",
    "cyan",
    "teal",
    "green",
    "yellow",
    "orange",
  ];
  const index = username.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
}
