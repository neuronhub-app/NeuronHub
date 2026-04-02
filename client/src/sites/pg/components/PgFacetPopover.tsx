import { Box, Flex, Icon, Popover, Portal, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoX } from "react-icons/go";
import { LuChevronDown } from "react-icons/lu";
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch";
import { Button } from "@/components/ui/button";
import type { TestId } from "@/e2e/ids";

export function PgFacetPopover(props: {
  attribute?: string;
  children: ReactNode;
  label: string;
  contentMaxW?: string;
  order?: { base?: number; md?: number; lg?: number };
  icon?: ReactNode;
  testId?: TestId;
}) {
  const clear = useClearRefinements({
    includedAttributes: props.attribute ? [props.attribute] : [],
  });

  const activeFacetCount = useActiveFacetCount(props.attribute);

  return (
    <Popover.Root
      positioning={{
        placement: "bottom-start",
        offset: { mainAxis: 4, crossAxis: 0 },
        listeners: false, // fix CLS on filter add (ENG-56).
      }}
    >
      <Popover.Trigger asChild>
        <Box
          data-testid={props.testId}
          display="flex"
          alignItems="center"
          w="full"
          bg="bg.card"
          color="fg"
          borderWidth="1px"
          borderColor="brand.gray"
          _hover={{ borderColor: "fg.muted" }}
          _open={{ borderColor: "fg" }}
          borderRadius="sm"
          justifyContent="space-between"
          px="2.5"
          h="10"
          fontSize="sm"
          cursor="pointer"
          order={props.order}
        >
          <Flex align="center" gap="1">
            <Flex align="center" gap="gap.sm">
              {props.icon && (
                <Icon boxSize="3.5" color="fg.muted" mt="-1px">
                  {props.icon}
                </Icon>
              )}
              {props.label}
            </Flex>

            {activeFacetCount > 0 && (
              <Text as="span" color="fg.subtle" fontSize="xs">
                ({activeFacetCount})
              </Text>
            )}
          </Flex>

          <Flex align="center" gap="gap.xs">
            {clear.canRefine && props.attribute && (
              <Button
                onClick={clear.refine}
                variant="ghost"
                size="xs"
                colorPalette="gray"
                color="fg.subtle"
                minW="6"
                h="6"
                paddingInline="1"
              >
                <Icon>
                  <GoX />
                </Icon>
              </Button>
            )}

            <Icon
              boxSize="4"
              css={{
                transition: "rotate 0.2s",
                "[data-scope=popover][data-state=open] &": { rotate: "180deg" },
              }}
            >
              <LuChevronDown />
            </Icon>
          </Flex>
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            css={{
              "--popover-size": "var(--reference-width)",
              "@media (min-width: 768px)": {
                width: "max-content",
                minWidth: "var(--reference-width)",
              },
            }}
            bg="bg.card"
            borderRadius="sm"
            borderWidth="1px"
            borderColor="fg"
            overflow="hidden"
            _open={{ animationStyle: "scale-fade-in", animationDuration: "moderate" }}
            _closed={{ animationStyle: "scale-fade-out", animationDuration: "moderate" }}
          >
            <Flex direction="column" maxH="90" overflowY="auto" p="3" maxW={props.contentMaxW}>
              {props.children}
            </Flex>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

function useActiveFacetCount(attribute?: string): number {
  const refinements = useCurrentRefinements({
    includedAttributes: attribute ? [attribute] : undefined,
  });
  if (!attribute) {
    return 0;
  }
  let count = 0;
  for (const item of refinements.items) {
    count += item.refinements.length;
  }
  return count;
}
