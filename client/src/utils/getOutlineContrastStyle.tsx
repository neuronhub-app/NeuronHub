import type { StackProps } from "@chakra-ui/react";

/**
 * It creates a gentle 6% (or 14%) contrast outline, matching the HTMLElement's color.
 *
 * Without it in Chakra you must set eg bg=red.500 and border=red.600 manually to achieve this, but this works for any HTMLElement color.
 *
 * Learnt from https://tailwindcss.com/docs/colors palette.
 */
export function getOutlineContrastStyle(props?: { variant: "subtle" }): StackProps {
  return {
    outline: "1px solid",
    outlineOffset: "calc(1px * -1)",
    outlineColor: {
      base: `color-mix(in oklab, #000 ${props?.variant === "subtle" ? 6 : 10}%, transparent)`,
      _dark: `color-mix(in oklab, #fff ${props?.variant === "subtle" ? 6 : 14}%, transparent)`,
    },
  };
}
