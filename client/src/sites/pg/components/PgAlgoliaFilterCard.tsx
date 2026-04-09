import { Box, Collapsible, Flex, HStack, Icon, Stack } from "@chakra-ui/react";
import { useEffect, useRef, type ReactNode } from "react";
import { LuChevronDown, LuSquareX } from "react-icons/lu";
import { useClearRefinements } from "react-instantsearch";
import {
  PgAlgoliaFacetsActive,
  type FacetsActiveConfig,
} from "@/sites/pg/components/PgAlgoliaFacetsActive";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export function PgFilterCardWithSplitBg(props: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function measureSplitHeight() {
      const rootElement = rootRef.current;
      if (rootElement) {
        rootElement.style.setProperty("--split-bg-h", `${rootElement.offsetHeight / 2}px`);
      }
    }
    measureSplitHeight();
    window.addEventListener("resize", measureSplitHeight);
    return () => window.removeEventListener("resize", measureSplitHeight);
  }, []);

  return (
    <Box ref={rootRef} pos="relative">
      <Box
        pos="absolute"
        top="0"
        left="-9999px"
        right="-9999px"
        h="var(--split-bg-h)"
        bg="brand.green"
      />
      <Box pos="relative">{props.children}</Box>
    </Box>
  );
}

export function PgFacetsActive(props: { facetsActive: FacetsActiveConfig }) {
  const clear = useClearRefinements();
  const isExtraActive = Boolean(props.facetsActive.extraTags?.length);
  const isActive = clear.canRefine || isExtraActive;
  if (!isActive) {
    return null;
  }
  return (
    <Collapsible.Root open={isActive} gridColumn="span 5" unmountOnExit lazyMount>
      <Collapsible.Content>
        <HStack gap="gap.md" align="flex-start" flexWrap="wrap">
          <PgAlgoliaFacetsActive config={props.facetsActive} />

          <PgRefinesClearButton
            onClear={props.facetsActive.onClearAdditional}
            isExtraActive={isExtraActive}
          />
        </HStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function PgMobileCollapsible(props: {
  cta?: ReactNode;
  facetsTopbar: ReactNode;
  facetsActive: FacetsActiveConfig;
}) {
  const state = useStateValtio({ isOpen: false });

  return (
    <Collapsible.Root
      open={state.snap.isOpen}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
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

          <HStack gap="gap.sm" align="flex-start" flexWrap="wrap">
            <PgAlgoliaFacetsActive config={props.facetsActive} />
            <PgRefinesClearButton
              onClear={props.facetsActive.onClearAdditional}
              isExtraActive={Boolean(props.facetsActive.extraTags?.length)}
            />
          </HStack>

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

function PgRefinesClearButton(props: { onClear?: () => void; isExtraActive?: boolean }) {
  const clear = useClearRefinements();

  if (!clear.canRefine && !props.isExtraActive) {
    return null;
  }

  return (
    <Flex
      as="button"
      onClick={() => {
        clear.refine();
        props.onClear?.();
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
