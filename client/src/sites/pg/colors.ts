/**
 * todo ! refac: bad location, must be in pg/theme/colors.ts
 */
// @ts-expect-error #bad-infer
import type { SemanticTokenDefinition } from "@chakra-ui/react";
import { defaultConfig } from "@chakra-ui/react";

import { theme as neuronTheme } from "@neuronhub/shared/theme/colors";

export namespace theme {
  const primary = {
    value: { _light: "{colors.brand.green}", _dark: "{colors.brand.green.light}" },
  };

  export const colors: SemanticTokenDefinition["colors"] = {
    ...neuronTheme.colors,

    brand: {
      green: {
        DEFAULT: { value: "#338050" },
        light: { value: "#4DB36D" },
        subtle: { value: { _light: "#DBEADD", _dark: "#202921" } },
      },
      seashell: { value: "#FFF7F0" },
      black: {
        DEFAULT: { value: "#343232" },
        secondary: { value: "#484E51" },
      },
      gray: {
        DEFAULT: { value: "#DDDDDD" },
        muted: { value: "#767676" },
        backdrop: { value: "#8F9293" },
        warm: { value: "#A19B9B" },
      },
      footer: { bg: { value: "#171616" } },
      beige: { value: "#F3EDE7" },
      hover: {
        background: { value: "#fff2cc" },
        underline: { value: "#ffbe2e" },
      },
    },

    primary,
    subtle: { value: { _light: "{colors.brand.gray}", _dark: "{colors.slate.700}" } },

    bg: {
      ...defaultConfig.theme?.semanticTokens?.colors?.bg,
      DEFAULT: { value: { _light: "{colors.brand.seashell}", _dark: "{colors.stone.950}" } },
      card: { value: { _light: "white", _dark: "{colors.slate.800}" } },
      backdrop: { value: "{colors.brand.gray.backdrop}/50" },

      // DEFAULT above isn't white -> it makes invalid the rels of bg <-> bg.panel
      // and forces to use bg="white", breaking the dark mode
      default_real: {
        value: { _light: "white", _dark: "black" },
      },
    },

    fg: {
      ...defaultConfig.theme?.semanticTokens?.colors?.fg,
      DEFAULT: { value: { _light: "{colors.brand.black}", _dark: "{colors.slate.200}" } },
      muted: { value: { _light: "{colors.brand.gray.muted}", _dark: "{colors.stone.400}" } },
      secondary: {
        value: { _light: "{colors.brand.black.secondary}", _dark: "{colors.slate.400}" },
      },
    },
  };
}
