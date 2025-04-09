import type { ReviewType } from "@/apps/reviews/list/index";
import { Avatar, Flex, Text } from "@chakra-ui/react";

export function ReviewAuthor(props: { author: ReviewType["author"] }) {
  return (
    <Flex align="center" gap="gap.sm">
      <Avatar.Root size="xs" variant="subtle" colorPalette="gray">
        <Avatar.Fallback name={props.author.name} />
        <Avatar.Image
          src={props.author.avatar?.url}
          filter="grayscale(0.4)"
          _hover={{
            filter: "grayscale(0)",
          }}
        />
      </Avatar.Root>
      <Text fontSize="sm" color="fg.muted">
        {props.author.name}
      </Text>
    </Flex>
  );
}
