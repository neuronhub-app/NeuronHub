import { Badge, Flex, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import { theme } from "@neuronhub/shared/theme/colors";
import type { PropsWithChildren } from "react";
import { datetime } from "@neuronhub/shared/utils/date-fns";

/**
 * #quality-10% #AI-slop
 *
 * Works, but badly:
 * - datetime.relative and .relativeRounded have wrong TZ
 * - redundant `em`
 * - the regex is #prob-redundant
 */
export function ChangelogEntry(
  props: PropsWithChildren<{
    title: string;
    date: string;
    version?: string;
    tags?: string[];
  }>,
) {
  const slug = props.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Stack
      mt="6"
      _first={{ mt: 1 }}
      pb="6"
      borderBottomWidth="1px"
      gap="0"
      css={{
        "& p": { marginTop: "0.4em", marginBottom: "0.4em" },
        "& ul, & ol": { marginTop: "0.25em", marginBottom: "0.25em" },
        "& li": { marginTop: "0", marginBottom: "0" },
      }}
    >
      <Flex align="baseline" justify="space-between" gap="4">
        <Heading as="h3" id={slug} mt="0">
          {props.title}
        </Heading>

        <Text textStyle="sm" color="fg.muted" flexShrink={0}>
          {datetime.relativeRounded(props.date)}
        </Text>
      </Flex>

      {props.tags && props.tags.length > 0 && (
        <HStack gap="2">
          {props.tags.map(tag => (
            <Badge key={tag} size="md" colorPalette="violet" textTransform="capitalize">
              {tag}
            </Badge>
          ))}
        </HStack>
      )}

      {props.children}
    </Stack>
  );
}
