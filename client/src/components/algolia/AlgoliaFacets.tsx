import { Flex, SkeletonText, Stack } from "@chakra-ui/react";
import { type ReactNode, useEffect } from "react";
import { useSearchBox, useStats } from "react-instantsearch";
import { gap } from "@neuronhub/shared/theme/spacings";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

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
  breakpoint: {
    md: "md",
    lg: "lg",
    xl: "2xl",
  },
} as const;

// #AI
export function AlgoliaFacets(props: {
  children: ReactNode;
  label: string;
  isSearchActive?: boolean;
}) {
  return (
    <Stack
      as="aside"
      aria-label="sidebar"
      pos="sticky"
      h="min"
      hideBelow="lg"
      p={{ base: gap.md, [facetStyle.breakpoint.md]: gap.md }}
      px={{ base: gap.md, [facetStyle.breakpoint.md]: gap.md }}
      w={{
        base: "",
        [facetStyle.breakpoint.md]: "sm",
        [facetStyle.breakpoint.lg]: "350px",
        [facetStyle.breakpoint.xl]: "400px",
      }}
      gap="gap.md2"
      borderRadius="lg"
      borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
      bg="bg.panel"
      {...getOutlineBleedingProps("muted")}
    >
      <SearchStats label={props.label} isSearchActive={props.isSearchActive} />
      {props.children}
    </Stack>
  );
}

function SearchStats(props: { label: string; isSearchActive?: boolean }) {
  const search = useSearchBox();
  const stats = useStats();

  const state = useStateValtio({
    total: null as number | null,
  });

  const isSearchActive = props.isSearchActive ?? search.query.length > 0;

  useEffect(() => {
    const isSearchActive = props.isSearchActive ?? search.query.length > 0;
    if (!isSearchActive && stats.nbHits > 0) {
      state.mutable.total = stats.nbHits;
    }
  }, [props.isSearchActive, stats.nbHits, search.query.length]);

  return (
    <Flex mb="-2">
      <Flex fontSize="xs" color="fg.subtle" gap="gap.sm">
        {isSearchActive ? (
          <>
            {stats.nbHits} / {state.snap.total} {props.label}
          </>
        ) : (
          <>
            {state.snap.total || <SkeletonText display="inline-flex" noOfLines={1} w="6" />}{" "}
            {props.label}
          </>
        )}
      </Flex>
    </Flex>
  );
}
