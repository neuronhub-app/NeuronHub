// @ts-expect-error
import type { SemanticTokenDefinition } from "@chakra-ui/react";
import { theme as neuronTheme } from "@/theme/colors";

export namespace theme {
  const primary = {
    value: { _light: "{colors.brand.green}", _dark: "{colors.brand.green.light}" },
  };

  export const colors: SemanticTokenDefinition["colors"] = {
    ...neuronTheme.colors,

    brand: {
      green: { value: "#338050" },
      "green.light": { value: "#4DB36D" },
      seashell: { value: "#FFF7F0" },
      black: { value: "#343232" },
      gray: { value: "#DDDDDD" },
      "gray.muted": { value: "#767676" },
    },

    primary,
    subtle: { value: { _light: "{colors.brand.gray}", _dark: "{colors.slate.700}" } },
    bg: { value: { _light: "{colors.brand.seashell}", _dark: "{colors.stone.950}" } },
    fg: {
      DEFAULT: { value: { _light: "{colors.brand.black}", _dark: "{colors.slate.200}" } },
      muted: { value: { _light: "{colors.brand.gray.muted}", _dark: "{colors.stone.400}" } },
    },
    "bg.card": { value: { _light: "white", _dark: "{colors.slate.800}" } },
    "bg.inverted": { value: { _light: "{colors.black}", _dark: "{colors.white}" } },
  };
}
