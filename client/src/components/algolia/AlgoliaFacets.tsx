import { Flex, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useSearchBox, useStats } from "react-instantsearch";
import { gap } from "@/theme/theme";

export const facetStyle = {
  label: {
    color: "fg.muted",
    fontSize: "13px",
    fontWeight: "semibold",
  },
  value: {
    display: "inline-flex",
    gap: "gap.sm",
    color: { _dark: "gray.300", _light: "gray.600" },
    fontSize: "13px",
  },
} as const;

// #AI
export function AlgoliaFacets(props: {
  children: ReactNode;
  stats?: { label: string; testId: string; isSearchActive?: boolean };
}) {
  return (
    <Stack
      as="aside"
      aria-label="sidebar"
      pos="sticky"
      h="min"
      hideBelow="lg"
      p={{ base: gap.md, md: gap.md }}
      px={{ base: gap.md, md: gap.md }}
      minW={{ base: "", md: "2xs", lg: "300px" }}
      maxW="300px"
      gap="gap.md2"
      borderRadius="lg"
      borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
      bg="bg.panel"
    >
      {props.stats && <SearchStats {...props.stats} />}
      {props.children}
    </Stack>
  );
}

// #AI
function SearchStats(props: { label: string; testId: string; isSearchActive?: boolean }) {
  const search = useSearchBox();
  const stats = useStats();
  const totalRef = useRef(0);

  const isSearchActive = props.isSearchActive ?? search.query.length > 0;
  const total = totalRef.current;

  if (!isSearchActive && stats.nbHits > 0) {
    totalRef.current = stats.nbHits;
  }

  return (
    <Flex mb="-2">
      {isSearchActive
        ? total && (
            <Text fontSize="xs" color="fg.subtle" data-testid={props.testId}>
              {stats.nbHits} / {total} {props.label}
            </Text>
          )
        : total && (
            <Text fontSize="xs" color="fg.subtle" data-testid={props.testId}>
              {total} {props.label}
            </Text>
          )}
    </Flex>
  );
}
