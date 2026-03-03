import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
  mergeConfigs,
} from "@chakra-ui/react";
import { theme } from "@/theme/colors";
import { recipes, slotRecipes } from "@/theme/recipes";

const tokens = defineTokens({
  assets: {
    logo: {
      value: {
        type: "svg",
        value: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
      },
    },
  },
  cursor: {
    button: { value: "pointer" },
  },
});

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: "teal",
        },
      },

      theme: {
        recipes,
        slotRecipes,
        tokens,
        semanticTokens: {
          colors: theme.colors,
          spacing: {
            gap: {}, // inherits from base
          },
        },
      },
    }),
  ),
);
