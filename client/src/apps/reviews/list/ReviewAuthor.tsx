import type { ReviewType } from "@/apps/reviews/list";
import { Avatar, Flex, Text } from "@chakra-ui/react";

export function ReviewAuthor(props: { author: ReviewType["author"] }) {
  return (
    <Flex align="center" gap="gap.sm">
      <Avatar.Root size="2xs" variant="subtle" colorPalette="gray">
        <Avatar.Fallback name={props.author.username} />
        <Avatar.Image
          src={props.author.avatar?.url}
          filter="grayscale(0.4)"
          _hover={{
            filter: "grayscale(0)",
          }}
        />
      </Avatar.Root>
      <Text fontSize="sm" color="fg.muted">
        {props.author.username}
      </Text>
    </Flex>
  );
}
