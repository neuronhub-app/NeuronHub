import { Box, Collapsible, Flex, HStack, Icon, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { LuChevronDown, LuSquareX } from "react-icons/lu";
import { useClearRefinements } from "react-instantsearch";
import {
  PgAlgoliaFacetsActive,
  type FacetsActiveConfig,
} from "@/sites/pg/components/PgAlgoliaFacetsActive";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export function PgFilterCardWithSplitBg(props: {
  children: ReactNode;
  isOpenRef: RefObject<boolean>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!props.isOpenRef.current) {
        rootElement.style.setProperty("--split-bg-h", `${rootElement.offsetHeight / 2}px`);
      }
    });
    observer.observe(rootElement);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      position="relative"
      ref={rootRef}
      style={{ "--split-bg-h": "50%" } as React.CSSProperties}
    >
      <Box
        position="absolute"
        top="0"
        left="-9999px"
        right="-9999px"
        h="var(--split-bg-h)"
        bg="brand.green"
      />
      <Box position="absolute" top="var(--split-bg-h)" left="-9999px" right="-9999px" bg="bg" />
      <Box position="relative">{props.children}</Box>
    </Box>
  );
}

export function PgFacetsActive(props: { facetsActive: FacetsActiveConfig }) {
  const clear = useClearRefinements();
  if (!clear.canRefine) {
    return null;
  }
  return (
    <Collapsible.Root open={clear.canRefine} gridColumn="span 5">
      <Collapsible.Content>
        <HStack gap="gap.md" align="flex-start">
          <PgAlgoliaFacetsActive config={props.facetsActive} />

          <PgRefinesClearButton />
        </HStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function PgMobileCollapsible(props: {
  cta?: ReactNode;
  facetsTopbar: ReactNode;
  facetsActive: FacetsActiveConfig;
  onOpenChange?: (open: boolean) => void;
}) {
  const state = useStateValtio({ isOpen: false });

  return (
    <Collapsible.Root
      open={state.snap.isOpen}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
        props.onOpenChange?.(details.open);
      }}
    >
      {!state.snap.isOpen && (
        <Collapsible.Trigger asChild>
          <Flex
            justify="center"
            align="center"
            gap="gap.xs"
            color="primary"
            fontSize="sm"
            fontWeight="medium"
            h="5"
            w="full"
            cursor="pointer"
          >
            Open Filters & Alerts
            <LuChevronDown />
          </Flex>
        </Collapsible.Trigger>
      )}
      <Collapsible.Content>
        <Stack gap="gap.sm">
          {props.facetsTopbar}

          <PgAlgoliaFacetsActive config={props.facetsActive} tagsGap="gap.sm">
            <PgRefinesClearButton />
          </PgAlgoliaFacetsActive>

          <Collapsible.Trigger asChild>
            <Flex
              justify="center"
              align="center"
              gap="gap.xs"
              color="primary"
              fontSize="sm"
              fontWeight="medium"
              cursor="pointer"
              w="full"
            >
              Close Filters & Alerts
              <Box transform="rotate(180deg)">
                <LuChevronDown />
              </Box>
            </Flex>
          </Collapsible.Trigger>

          {props.cta}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function PgRefinesClearButton() {
  const clear = useClearRefinements();

  if (!clear.canRefine) {
    return null;
  }

  return (
    <Flex
      as="button"
      onClick={() => {
        clear.refine();
      }}
      align="center"
      gap="gap.xs"
      color="brand.green"
      fontSize="sm"
      fontWeight="medium"
      cursor="pointer"
      _hover={{ color: "brand.green.light" }}
      whiteSpace="nowrap"
      h="6"
    >
      <Icon boxSize="3.5">
        <LuSquareX />
      </Icon>
      Clear all
    </Flex>
  );
}
