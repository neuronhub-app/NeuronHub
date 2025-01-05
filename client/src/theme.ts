import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
  mergeConfigs,
} from "@chakra-ui/react";

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
  // seems to be broken either on MacOS or Chakra. I don't believe this need specification. But it barer works, and only if i use _hover.
  // todo remove
  cursor: {
    button: { value: "pointer" },
  },
});

// docs propose to use `createSystem(defaultBaseConfig, customConfig)`, but it doesn't work. Few other methods don't work either.
export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: "blue", // Set your default color palette here
        },
      },

      theme: {
        tokens,
        semanticTokens: {
          colors: {
            bg: {
              light: {
                value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" },
              },
            },
            primary: {
              value: "{colors.blue.500}",
            },
            //
            // gray: {
            //   100: { value: "{colors.gray.100}" },
            //   200: { value: "{colors.gray.200}" },
            //   300: { value: "{colors.gray.300}" },
            // },
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
