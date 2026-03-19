/**
 * #AI
 */
import { Kbd, Text, chakra, Flex } from "@chakra-ui/react";
import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { DocsSearchClient } from "@/components/DocsSearchClient";

export function DocsSearch() {
  return (
    <>
      <chakra.button
        {...ids.set(ids.search.trigger)}
        display="flex"
        alignItems="center"
        gap="2"
        w="full"
        px="3"
        py="1.5"
        borderWidth="1px"
        bg="bg"
        rounded="md"
        transition="backgrounds"
        transitionDuration="fast"
        color="fg.muted"
        textStyle="sm"
        cursor="pointer"
        _hover={{ bg: "bg.muted" }}
      >
        <Text flex="1" textAlign="start">
          Search docs...
        </Text>
        <Kbd size="sm" variant="subtle">
          <Flex gap="1">
            <Text fontSize="md">⌘</Text>
            <Text>+</Text>
            <Text>K</Text>
          </Flex>
        </Kbd>
      </chakra.button>
      {isAlgoliaEnabled && <DocsSearchClient />}
    </>
  );
}

const isAlgoliaEnabled = Boolean(
  env.VITE_ALGOLIA_APPLICATION_ID &&
    env.VITE_ALGOLIA_SEARCH_API_KEY &&
    env.VITE_ALGOLIA_INDEX_DOCS,
);
