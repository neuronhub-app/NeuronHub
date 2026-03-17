import { Card, HStack, Icon, Text } from "@chakra-ui/react";
import { type IconType } from "react-icons";

import { LinkInt } from "@/components/LinkInt";
import { ReactRouterPath } from "@/utils/types";

export function GuideCard(props: {
  icon: IconType;
  title: string;
  description: string;
  path: ReactRouterPath;
}) {
  return (
    <LinkInt path={props.path} textDecoration="none">
      <Card.Root
        h="full"
        w="full"
        transition="backgrounds"
        transitionDuration="fast"
        _hover={{ bg: "bg.muted" }}
        cursor="pointer"
      >
        <Card.Body gap="gap.md2" p="gap.lg">
          <HStack align="center">
            <Icon color="colorPalette.fg">
              <props.icon />
            </Icon>
            <Card.Title fontSize="lg" my="0">
              {props.title}
            </Card.Title>
          </HStack>

          <Text color="fg.muted" my="0" fontSize="sm">
            {props.description}
          </Text>
        </Card.Body>
      </Card.Root>
    </LinkInt>
  );
}
