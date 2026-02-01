import { Flex, Icon, IconButton, type JsxStyleProps } from "@chakra-ui/react";
import { FaComment } from "react-icons/fa6";
import { NavLink } from "react-router";

export function PostCommentsLink(props: {
  url: string;
  count: number;
  iconColor?: JsxStyleProps["color"];
  textColor?: JsxStyleProps["color"];
  fontSize?: JsxStyleProps["fontSize"];
  gap?: JsxStyleProps["gap"];
}) {
  return (
    <NavLink to={props.url} style={{ width: "min-content" }}>
      <IconButton
        display="flex"
        variant="plain"
        colorPalette="gray"
        color={props.iconColor ?? { _dark: "gray.700", _light: "gray.300" }}
        _hover={{ color: "gray.500" }}
        size="sm"
        h="min"
        gap={props.gap ?? "1"}
        aria-label="Comments"
      >
        <Icon boxSize="12px" mb="-1px">
          <FaComment />
        </Icon>{" "}
        <Flex
          fontVariantNumeric="tabular-nums"
          fontSize={props.fontSize ?? "xs"}
          color={props.textColor ?? "fg.subtle"}
        >
          {props.count}
        </Flex>
      </IconButton>
    </NavLink>
  );
}
