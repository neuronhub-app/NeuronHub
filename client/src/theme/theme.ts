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
      // LucideWebhook
      value: {
        type: "svg",
        value: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-webhook"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/></svg>`,
      },
    },
  },
  // seems to be broken either on MacOS or Chakra. I don't believe this need specification. But it barely works, and only if i use _hover.
  // todo maybe: remove
  cursor: {
    button: { value: "pointer" },
  },
});

export const gap = {
  label: "{spacing.1.5}",

  xs: "{spacing.0.5}",
  sm: "{spacing.1.5}", // todo ? refac: replace with gap.sm2 & gap.xs - AFAIK gap.xs isn't used anyway
  sm2: "{spacing.3}",
  md: "{spacing.4}", // todo ? refac: replace with gap.md2
  md2: "{spacing.5}",
  lg: "{spacing.7}",
  xl: "{spacing.10}", // todo maybe: set to Sidebar's Content padding (ie alias?)
};

// docs propose to use `createSystem(defaultBaseConfig, customConfig)`, but it doesn't work. Few other methods don't work either.
export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: "blue",
        },
        // todo refac: move to apps.highlight, import from it in globalCss
        mark: {
          bg: { _dark: "sky.600", _light: "sky.200" },
          transition: "background 0.3s",
          _hover: {
            bg: {
              _dark: "sky.500",
              _light: "sky.300",
            },
            cursor: "pointer",
          },
          get _active() {
            return this._hover;
          },
          get _focus() {
            return this._hover;
          },
        },
      },

      theme: {
        recipes,
        slotRecipes,
        tokens,
        semanticTokens: {
          colors: theme.colors,
          spacing: {
            gap: Object.fromEntries(
              Object.entries(gap).map(([key, value]) => [key, { value: value }]),
            ),
          },
        },
        // breakpoints: {
        //   sm: "320px",
        //   md: "768px",
        // },
      },
    }),
  ),
);
