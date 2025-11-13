import { Icon, Menu, Portal, Spinner } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { highlight_attrs } from "@/apps/highlighter/PostContentHighlighted";
import { ids } from "@/e2e/ids";

export function PostContentHighlightMenu(props: {
  children: ReactNode;
  activeHighlightId: string | null;
  onDelete: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <Menu.Root
      positioning={{
        getAnchorRect: () => {
          const elem = document.querySelector(
            `[data-${highlight_attrs.highlightId}="${props.activeHighlightId}"]`,
          )!;
          return elem.getBoundingClientRect();
        },
        placement: "bottom",
      }}
      open={Boolean(props.activeHighlightId)}
      onPointerDownOutside={props.onClose}
    >
      {props.children}

      <Portal>
        <Menu.Positioner>
          <Menu.Arrow />
          <Menu.Content minW="auto" p={0}>
            <Menu.Item
              value="remove"
              onClick={props.onDelete}
              disabled={props.loading}
              {...ids.set(ids.highlighter.btn.delete)}
            >
              {props.loading ? (
                <Spinner size="sm" />
              ) : (
                <Icon boxSize={4}>
                  <FaTrashCan />
                </Icon>
              )}
              Remove
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
