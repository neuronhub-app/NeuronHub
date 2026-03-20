// @ts-expect-error
import type { SemanticTokenDefinition } from "@chakra-ui/react";
import { theme as neuronTheme } from "@neuronhub/shared/theme/colors";

export namespace theme {
  const primary = {
    value: { _light: "{colors.brand.green}", _dark: "{colors.brand.green.light}" },
  };

  export const colors: SemanticTokenDefinition["colors"] = {
    ...neuronTheme.colors,

    brand: {
      green: { value: "#338050" },
      "green.light": { value: "#4DB36D" },
      "green.subtle": { value: "#DBEADD" },
      seashell: { value: "#FFF7F0" },
      black: { value: "#343232" },
      "black.pure": { value: "#000000" },
      "black.secondary": { value: "#484E51" },
      gray: { value: "#DDDDDD" },
      "gray.muted": { value: "#767676" },
      "gray.backdrop": { value: "#8F9293" },
      "footer.bg": { value: "#171616" },
      "footer.text": { value: "#F3EDE7" },
      "footer.heading": { value: "#A19B9B" },
    },

    primary,
    subtle: { value: { _light: "{colors.brand.gray}", _dark: "{colors.slate.700}" } },
    bg: { value: { _light: "{colors.brand.seashell}", _dark: "{colors.stone.950}" } },
    fg: {
      DEFAULT: { value: { _light: "{colors.brand.black}", _dark: "{colors.slate.200}" } },
      muted: { value: { _light: "{colors.brand.gray.muted}", _dark: "{colors.stone.400}" } },
      secondary: {
        value: { _light: "{colors.brand.black.secondary}", _dark: "{colors.slate.400}" },
      },
    },
    "bg.card": { value: { _light: "white", _dark: "{colors.slate.800}" } },
    "bg.inverted": { value: { _light: "{colors.black}", _dark: "{colors.white}" } },
    "bg.backdrop": { value: "{colors.brand.gray.backdrop}/50" },
  };
}
