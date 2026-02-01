import type { StackProps } from "@chakra-ui/react"; // FYI: JsxStyleProps doesn't satisfy <Stack>

/**
 * It creates a gentle 6% (or 14%) contrast outline, matching the HTMLElement's color.
 *
 * Without it in Chakra you must set eg bg=red.500 and border=red.600 manually to achieve this, but this works for any HTMLElement color.
 *
 * Learnt from https://tailwindcss.com/docs/colors color palette squares.
 */
export function getOutlineBleedingProps(
  variant: "default" | "subtle" | "muted" = "default",
): StackProps {
  let transparency = {
    light: 10,
    dark: 14,
  };
  switch (variant) {
    case "subtle":
      transparency = { light: 4, dark: 3 };
      break;
    case "muted":
      transparency = { light: 6, dark: 6 };
      break;
  }
  return {
    outline: "1px solid",
    outlineOffset: "calc(1px * -1)",
    outlineColor: {
      _light: `color-mix(in oklab, black ${transparency.light}%, transparent)`,
      _dark: `color-mix(in oklab, white ${transparency.dark}%, transparent)`,
    },
  };
}
