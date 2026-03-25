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

    bg: {
      DEFAULT: { value: { _light: "{colors.brand.seashell}", _dark: "{colors.stone.950}" } },
      subtle: { value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" } },
      muted: { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
      emphasized: { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" } },
      inverted: { value: { _light: "{colors.black}", _dark: "{colors.white}" } },
      panel: { value: { _light: "{colors.white}", _dark: "{colors.gray.950}" } },
      error: { value: { _light: "{colors.red.50}", _dark: "{colors.red.950}" } },
      warning: { value: { _light: "{colors.orange.50}", _dark: "{colors.orange.950}" } },
      success: { value: { _light: "{colors.green.50}", _dark: "{colors.green.950}" } },
      info: { value: { _light: "{colors.blue.50}", _dark: "{colors.blue.950}" } },
      card: { value: { _light: "white", _dark: "{colors.slate.800}" } },
      backdrop: { value: "{colors.brand.gray.backdrop}/50" },
    },

    fg: {
      DEFAULT: { value: { _light: "{colors.brand.black}", _dark: "{colors.slate.200}" } },
      muted: { value: { _light: "{colors.brand.gray.muted}", _dark: "{colors.stone.400}" } },
      secondary: {
        value: { _light: "{colors.brand.black.secondary}", _dark: "{colors.slate.400}" },
      },
      subtle: { value: { _light: "{colors.gray.400}", _dark: "{colors.gray.500}" } },
      inverted: { value: { _light: "{colors.gray.50}", _dark: "{colors.black}" } },
      error: { value: { _light: "{colors.red.500}", _dark: "{colors.red.400}" } },
      warning: { value: { _light: "{colors.orange.600}", _dark: "{colors.orange.300}" } },
      success: { value: { _light: "{colors.green.600}", _dark: "{colors.green.300}" } },
      info: { value: { _light: "{colors.blue.600}", _dark: "{colors.blue.300}" } },
    },
  };
}
