import { ReactNode } from "react";
import { Badge, Blockquote, Box, Float, Icon, SystemStyleObject } from "@chakra-ui/react";
import { GoInfo } from "react-icons/go";

export function Notice(props: { children: ReactNode }) {
  const style: SystemStyleObject = {
    color: "fg.subtle",
    offset: 1,
    borderColor: { _dark: "border", _light: "border.muted" },
  };

  return (
    <Box pt={style.offset}>
      <Blockquote.Root variant="plain" pl="0">
        <Float placement="top-start" offsetY={`-${style.offset}`} offsetX="7">
          <Badge
            variant="subtle"
            colorPalette="gray"
            color="fg.muted"
            bg={style.borderColor}
            borderRadius="xs"
            size="sm"
          >
            <Icon color={{ _dark: style.color, _light: "fg.muted" }}>
              <GoInfo />
            </Icon>
            Note
          </Badge>
        </Float>

        <Blockquote.Content pt="3.5" pb="2" color={style.color} borderColor={style.borderColor}>
          {props.children}
        </Blockquote.Content>
      </Blockquote.Root>
    </Box>
  );
}
