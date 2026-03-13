import { Box, Popover, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

export function PgFacetPopover(props: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          bg="bg.panel"
          borderRadius="md"
          _hover={{ bg: "bg.subtle" }}
          disabled={props.disabled}
        >
          {props.label}
          <LuChevronDown />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            p="gap.md"
            minW="220px"
            maxH="400px"
            overflowY="auto"
            bg="bg.panel"
            borderRadius="lg"
            {...getOutlineBleedingProps("muted")}
          >
            <Box>{props.children}</Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
