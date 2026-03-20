import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineTokens,
  mergeConfigs,
} from "@chakra-ui/react";
import { theme } from "@/sites/pg/colors";
import { recipes, slotRecipes } from "@/theme/recipes";

const pgRecipes = {
  ...recipes,
  button: defineRecipe({
    ...recipes.button,
    variants: {
      ...recipes.button.variants,
      variant: {
        ...recipes.button.variants?.variant,
        "pg-primary": {
          bg: "brand.green.light",
          color: "white",
          _hover: { bg: "brand.green" },
        },
      },
    },
  }),
  container: defineRecipe({ base: { maxWidth: "1280px" } }),
};

const tokens = defineTokens({
  radii: {
    sm: { value: "4px" },
    md: { value: "5px" },
    lg: { value: "10px" },
  },
  fonts: {
    body: { value: "'DM Sans', sans-serif" },
    heading: { value: "'IBM Plex Serif', serif" },
  },
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

export const gap = {
  xs: "{spacing.1.5}", // 6px
  sm: "{spacing.2.5}", // 10px
  md: "{spacing.4}", // 16px
  lg: "{spacing.5}", // 20px
  xl: "{spacing.6}", // 24px
};

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: "green",
        },
        "[data-part='backdrop']": {
          bg: "bg.backdrop",
        },
      },

      theme: {
        recipes: pgRecipes,
        slotRecipes,
        tokens,
        semanticTokens: {
          colors: theme.colors,
          spacing: {
            gap: Object.fromEntries(Object.entries(gap).map(([key, value]) => [key, { value }])),
          },
        },
      },
    }),
  ),
);
