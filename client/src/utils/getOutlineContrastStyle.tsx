import type { JsxStyleProps } from "@chakra-ui/react";
// @ts-ignore
import type { StackProps } from "@chakra-ui/react/dist/types/components/stack/stack";

/**
 * It creates a gentle 7% (or 14%) contrast outline, while perfectly matching the HTMLElement's color.
 * In Chakra you would set bg=red.500 and border=red.600, but this method is universal.
 *
 * Learnt from https://tailwindcss.com/docs/colors palette.
 */
export function getOutlineContrastStyle(props?: {
  variant: "subtle";
}): JsxStyleProps | StackProps {
  return {
    outline: "1px solid",
    outlineOffset: "calc(1px * -1)",
    outlineColor: {
      base: `color-mix(in oklab, #000 ${props?.variant === "subtle" ? 6 : 10}%, transparent)`,
      _dark: `color-mix(in oklab, #fff ${props?.variant === "subtle" ? 6 : 14}%, transparent)`,
    },
  };
}
