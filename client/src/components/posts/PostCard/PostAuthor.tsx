import { Avatar, Flex, Text } from "@chakra-ui/react";
import type { PostListItemType } from "@/components/posts/ListContainer";

export function PostAuthor(props: { post: PostListItemType }) {
  const username = props.post.author?.username ?? props.post.source_author;
  return (
    <Flex align="center" gap="gap.sm">
      <Avatar.Root
        size="2xs"
        variant="subtle"
        colorPalette={getAvatarColorForUsername(username)}
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
