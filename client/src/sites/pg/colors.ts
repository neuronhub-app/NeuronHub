// @ts-expect-error
import type { SemanticTokenDefinition } from "@chakra-ui/react";
import { theme as neuronTheme } from "@/theme/colors";

export namespace theme {
  const primary = { value: { base: "#338050", _dark: "#4a9e66" } };

  export const colors: SemanticTokenDefinition["colors"] = {
    ...neuronTheme.colors,

    primary,
    subtle: { value: { _light: "{colors.slate.300}", _dark: "{colors.slate.700}" } },
    bg: { value: { _light: "{colors.orange.50}", _dark: "{colors.stone.950}" } },
    fg: {
      DEFAULT: { value: { _light: "{colors.slate.800}", _dark: "{colors.slate.200}" } },
      muted: { value: { _light: "{colors.stone.500}", _dark: "{colors.stone.400}" } },
    },
    "bg.card": { value: { _light: "white", _dark: "{colors.slate.800}" } },
  };
}
