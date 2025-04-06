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

export namespace theme {
  export const secondary = "teal";
}
const secondary = "teal";

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
            primary: {
              value: { base: "{colors.blue.500}", _dark: "{colors.blue.400}" },
            },

            fg: {
              "muted-button": {
                value: {
                  base: "{colors.slate.500}",
                  _dark: "{colors.slate.500}",
                },
              },
              "fieldset-title": {
                value: {
                  base: "{colors.slate.500}",
                  _dark: "{colors.slate.500}",
                },
              },
              secondary: {
                value: {
                  base: `{colors.${secondary}.600}`,
                  _dark: `{colors.${secondary}.500}`,
                },
              },
              muted: {
                value: {
                  _light: "{colors.slate.700}",
                  _dark: "{colors.slate.200}",
                },
              },
            },

            bg: {
              light: {
                value: {
                  base: "{colors.slate.100}",
                  _dark: "{colors.slate.900}",
                },
              },
              medium: {
                value: {
                  base: "{colors.slate.subtle}",
                  _dark: "{colors.slate.subtle}",
                },
              },
              solid: {
                value: {
                  base: "{colors.slate.muted}",
                  _dark: "{colors.slate.muted}",
                },
              },

              secondary: {
                light: {
                  value: {
                    base: `{colors.${secondary}.100}`,
                    _dark: `{colors.${secondary}.950}`,
                  },
                },
                medium: {
                  value: {
                    base: `{colors.${secondary}.500/80}`,
                    _dark: `{colors.${secondary}.700}`,
                  },
                },
              },
            },

            // tailwind

            emerald: {
              50: { value: "oklch(97.9% 0.021 166.113)" },
              100: { value: "oklch(95% 0.052 163.051)" },
              200: { value: "oklch(90.5% 0.093 164.15)" },
              300: { value: "oklch(84.5% 0.143 164.978)" },
              400: { value: "oklch(76.5% 0.177 163.223)" },
              500: { value: "oklch(69.6% 0.17 162.48)" },
              600: { value: "oklch(59.6% 0.145 163.225)" },
              700: { value: "oklch(50.8% 0.118 165.612)" },
              800: { value: "oklch(43.2% 0.095 166.913)" },
              900: { value: "oklch(37.8% 0.077 168.94)" },
              950: { value: "oklch(26.2% 0.051 172.552)" },
              ...getChakraColorSemanticDefaults("emerald"),
            },
            cyan: {
              50: { value: "oklch(0.984 0.019 200.873)" },
              100: { value: "oklch(0.956 0.045 203.388)" },
              200: { value: "oklch(0.917 0.08 205.041)" },
              300: { value: "oklch(0.865 0.127 207.078)" },
              400: { value: "oklch(0.789 0.154 211.53)" },
              500: { value: "oklch(0.715 0.143 215.221)" },
              600: { value: "oklch(0.609 0.126 221.723)" },
              700: { value: "oklch(0.52 0.105 223.128)" },
              800: { value: "oklch(0.45 0.085 224.283)" },
              900: { value: "oklch(0.398 0.07 227.392)" },
              950: { value: "oklch(0.302 0.056 229.695)" },
              ...getChakraColorSemanticDefaults("cyan"),
            },
            indigo: {
              50: { value: "oklch(0.962 0.018 272.314)" },
              100: { value: "oklch(0.93 0.034 272.788)" },
              200: { value: "oklch(0.87 0.065 274.039)" },
              300: { value: "oklch(0.785 0.115 274.713)" },
              400: { value: "oklch(0.673 0.182 276.935)" },
              500: { value: "oklch(0.585 0.233 277.117)" },
              600: { value: "oklch(0.511 0.262 276.966)" },
              700: { value: "oklch(0.457 0.24 277.023)" },
              800: { value: "oklch(0.398 0.195 277.366)" },
              900: { value: "oklch(0.359 0.144 278.697)" },
              950: { value: "oklch(0.257 0.09 281.288)" },
              ...getChakraColorSemanticDefaults("indigo"),
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
            slate: {
              50: { value: "oklch(0.984 0.003 247.858)" },
              100: { value: "oklch(0.968 0.007 247.896)" },
              200: { value: "oklch(0.929 0.013 255.508)" },
              300: { value: "oklch(0.869 0.022 252.894)" },
              400: { value: "oklch(0.704 0.04 256.788)" },
              500: { value: "oklch(0.554 0.046 257.417)" },
              600: { value: "oklch(0.446 0.043 257.281)" },
              700: { value: "oklch(0.372 0.044 257.287)" },
              800: { value: "oklch(0.279 0.041 260.031)" },
              900: { value: "oklch(0.208 0.042 265.755)" },
              950: { value: "oklch(0.129 0.042 264.695)" },
              // based on Chakra's Gray
              contrast: {
                value: { _light: "{colors.white}", _dark: "{colors.black}" },
              },
              fg: {
                value: {
                  _light: "{colors.slate.800}",
                  _dark: "{colors.slate.200}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.slate.200}", // 100 → 200
                  _dark: "{colors.slate.800}", // 900 → 800
                },
              },
              muted: {
                value: {
                  _light: "{colors.slate.400}",
                  _dark: "{colors.slate.500}", // 800 → 500
                },
              },
              emphasized: {
                value: {
                  _light: "{colors.slate.300}",
                  _dark: "{colors.slate.700}",
                },
              },
              solid: {
                value: {
                  _light: "{colors.slate.900}",
                  _dark: "{colors.white}",
                },
              },
              focusRing: {
                value: {
                  _light: "{colors.slate.800}",
                  _dark: "{colors.slate.200}",
                },
              },
            },
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
          },
          spacing: {
            gap: {
              label: { value: "{spacing.1.5}" },

              sm: { value: "{spacing.1.5}" },
              md: { value: "{spacing.4}" },
              lg: { value: "{spacing.7}" },
              xl: { value: "{spacing.10}" }, // todo set to Sidebar's Content padding
            },
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
      // chakra = 900, tailwind = 950
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
