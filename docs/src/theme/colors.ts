// Copied from [[client/src/theme/colors.ts]]

// @ts-expect-error
import type { SemanticTokenDefinition } from "@chakra-ui/react";

export namespace theme {
  const colorPrimary = "blue";
  const colorSecondary = "teal";

  const primary = {
    value: { base: `{colors.${colorPrimary}.500}`, _dark: `{colors.${colorPrimary}.400}` },
  };

  export const colors: SemanticTokenDefinition["colors"] = {
    primary,

    fg: {
      "dark-friendly": {
        value: { _light: "fg", _dark: "{colors.gray.300/88}" },
      },
      primary,
      secondary: {
        value: {
          _light: `{colors.${colorSecondary}.600}`,
          _dark: `{colors.${colorSecondary}.500}`,
        },
      },
    },

    // tailwind

    blue: {
      50: { value: "oklch(0.97 0.014 254.604)" },
      100: { value: "oklch(0.932 0.032 255.585)" },
      200: { value: "oklch(0.882 0.059 254.128)" },
      300: { value: "oklch(0.809 0.105 251.813)" },
      400: { value: "oklch(0.707 0.165 254.624)" },
      500: { value: "oklch(0.623 0.214 259.815)" },
      600: { value: "oklch(0.546 0.245 262.881)" },
      700: { value: "oklch(0.488 0.243 264.376)" },
      800: { value: "oklch(0.424 0.199 265.638)" },
      900: { value: "oklch(0.379 0.146 265.522)" },
      950: { value: "oklch(0.282 0.091 267.935)" },
      ...getChakraColorSemanticDefaults("blue"),
    },
    teal: {
      50: { value: "oklch(0.984 0.014 180.72)" },
      100: { value: "oklch(0.953 0.051 180.801)" },
      200: { value: "oklch(0.91 0.096 180.426)" },
      300: { value: "oklch(0.855 0.138 181.071)" },
      400: { value: "oklch(0.777 0.152 181.912)" },
      500: { value: "oklch(0.704 0.14 182.503)" },
      600: { value: "oklch(0.6 0.118 184.704)" },
      700: { value: "oklch(0.511 0.096 186.391)" },
      800: { value: "oklch(0.437 0.078 188.216)" },
      900: { value: "oklch(0.386 0.063 188.416)" },
      950: { value: "oklch(0.277 0.046 192.524)" },
      ...getChakraColorSemanticDefaults("teal"),
    },
    sky: {
      50: { value: "oklch(0.977 0.013 236.62)" },
      100: { value: "oklch(0.951 0.026 236.824)" },
      200: { value: "oklch(0.901 0.058 230.902)" },
      300: { value: "oklch(0.828 0.111 230.318)" },
      400: { value: "oklch(0.746 0.16 232.661)" },
      500: { value: "oklch(0.685 0.169 237.323)" },
      600: { value: "oklch(0.588 0.158 241.966)" },
      700: { value: "oklch(0.5 0.134 242.749)" },
      800: { value: "oklch(0.443 0.11 240.79)" },
      900: { value: "oklch(0.391 0.09 240.876)" },
      950: { value: "oklch(0.293 0.066 243.157)" },
      ...getChakraColorSemanticDefaults("sky"),
    },
    stone: {
      50: { value: "oklch(0.985 0.001 106.423)" },
      100: { value: "oklch(0.97 0.001 106.424)" },
      200: { value: "oklch(0.923 0.003 48.717)" },
      300: { value: "oklch(0.869 0.005 56.366)" },
      400: { value: "oklch(0.706 0.01 56.259)" },
      500: { value: "oklch(0.553 0.013 58.071)" },
      600: { value: "oklch(0.444 0.011 73.639)" },
      700: { value: "oklch(0.374 0.01 67.558)" },
      800: { value: "oklch(0.268 0.007 34.298)" },
      900: { value: "oklch(0.216 0.006 56.043)" },
      950: { value: "oklch(0.147 0.004 49.25)" },
      ...getChakraColorSemanticDefaults("stone"),
    },
    green: {
      50: { value: "oklch(0.982 0.018 155.826)" },
      100: { value: "oklch(0.962 0.044 156.743)" },
      200: { value: "oklch(0.925 0.084 155.995)" },
      300: { value: "oklch(0.871 0.15 154.449)" },
      400: { value: "oklch(0.792 0.209 151.711)" },
      500: { value: "oklch(0.723 0.219 149.579)" },
      600: { value: "oklch(0.627 0.194 149.214)" },
      700: { value: "oklch(0.527 0.154 150.069)" },
      800: { value: "oklch(0.448 0.119 151.328)" },
      900: { value: "oklch(0.393 0.095 152.535)" },
      950: { value: "oklch(0.266 0.065 152.934)" },
      ...getChakraColorSemanticDefaults("green"),
    },
  };
}

/**
 * Note that Tailwind's max is 950, which made me adjust 900 to 950, commented where it was done.
 *
 * And note all Chakra colors have same semantic tokens, eg Blue vs Yellow
 *
 * See @chakra-ui/react/dist/cjs/theme/semantic-tokens/colors.cjs
 */
function getChakraColorSemanticDefaults(name: string) {
  return {
    contrast: {
      value: { _light: "white", _dark: "white" },
    },
    fg: {
      value: { _light: `{colors.${name}.700}`, _dark: `{colors.${name}.300}` },
    },
    subtle: {
      value: { _light: `{colors.${name}.100}`, _dark: `{colors.${name}.950}` },
    },
    muted: {
      value: { _light: `{colors.${name}.200}`, _dark: `{colors.${name}.800}` },
    },
    emphasized: {
      value: { _light: `{colors.${name}.300}`, _dark: `{colors.${name}.700}` },
    },
    solid: {
      value: { _light: `{colors.${name}.600}`, _dark: `{colors.${name}.600}` },
    },
    focusRing: {
      value: { _light: `{colors.${name}.600}`, _dark: `{colors.${name}.600}` },
    },
  };
}
