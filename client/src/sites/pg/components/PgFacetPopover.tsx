import { Flex, Icon, Popover, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function PgFacetPopover(props: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClose?: () => void;
  contentMaxW?: string;
}) {
  return (
    <Popover.Root
      positioning={{ placement: "bottom-start", offset: { mainAxis: 4, crossAxis: 0 } }}
      onOpenChange={details => {
        if (!details.open) {
          props.onClose?.();
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="md"
          w="full"
          bg="bg.card"
          color="fg"
          borderColor="brand.gray"
          _open={{ borderColor: "fg" }}
          borderRadius="sm"
          justifyContent="space-between"
          px="2.5"
          disabled={props.disabled}
        >
          {props.label}
          <Icon
            boxSize="4"
            css={{ transition: "rotate 0.2s", "[data-state=open] &": { rotate: "180deg" } }}
          >
            <LuChevronDown />
          </Icon>
        </Button>
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
