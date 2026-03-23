import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  mergeConfigs,
} from "@chakra-ui/react";
import { theme } from "@neuronhub/shared/theme/colors";
import { gap } from "@neuronhub/shared/theme/spacings";

const recipes = {
  code: defineRecipe({
    base: {
      colorPalette: "gray",
    },
  }),
  link: defineRecipe({
    base: {
      colorPalette: theme.colorSecondary,
    },
  }),
};

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: theme.colorPrimary,
        },
        ".ais-Snippet-highlighted, .ais-Highlight-highlighted": {
          bgColor: `{colors.violet.emphasized}`,
          color: "fg",
        },
      },
      theme: {
        recipes,
        semanticTokens: {
          colors: theme.colors,
          spacing: {
            gap: Object.fromEntries(
              Object.entries(gap).map(([key, value]) => [key, { value: value }]),
            ),
          },
        },
      },
    }),
  ),
);
