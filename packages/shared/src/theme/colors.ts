// @ts-expect-error
import type { SemanticTokenDefinition } from "@chakra-ui/react";

export namespace theme {
  export const colorPrimary = "blue";
  export const colorSecondary = "teal";

  const primary = {
    value: { base: `{colors.${colorPrimary}.500}`, _dark: `{colors.${colorPrimary}.400}` },
  };

  export const colors: SemanticTokenDefinition["colors"] = {
    primary,

    fg: {
      "dark-friendly": {
        value: { _light: "fg", _dark: "{colors.gray.300/88}" },
      },
      "muted-button": {
        value: { _light: "{colors.slate.500}", _dark: "{colors.slate.500}" },
      },
      "fieldset-title": {
        value: { _light: "{colors.slate.500}", _dark: "{colors.slate.500}" },
      },
      primary,
      "primary-muted": {
        value: {
          _light: `{colors.${colorPrimary}.400}`,
          _dark: `{colors.${colorPrimary}.500}`,
        },
      },
      secondary: {
        DEFAULT: {
          value: {
            _light: `{colors.${colorSecondary}.600}`,
            _dark: `{colors.${colorSecondary}.500}`,
          },
        },
        hover: {
          value: {
            _light: `{colors.${colorSecondary}.700}`,
            _dark: `{colors.${colorSecondary}.400}`,
          },
        },
      },
    },

    bg: {
      light: {
        value: { _light: "{colors.white}", _dark: "{colors.black}" },
      },
      medium: {
        value: {
          _light: "{colors.slate.subtle}",
          _dark: "{colors.slate.subtle}",
        },
      },
      solid: {
        value: {
          _light: "{colors.slate.muted}",
          _dark: "{colors.slate.muted}",
        },
      },

      secondary: {
        light: {
          value: {
            _light: `{colors.${colorSecondary}.100}`,
            _dark: `{colors.${colorSecondary}.950/70}`,
          },
        },
        medium: {
          value: {
            _light: `{colors.${colorSecondary}.500/80}`,
            _dark: `{colors.${colorSecondary}.800}`,
          },
        },
      },
    },

    // tailwind

    gray: {
      50: { value: "lab(98.2596% -.247031 -.706708)" },
      100: { value: "lab(96.1596% -.0823438 -1.13575)" },
      200: { value: "lab(91.6229% -.159115 -2.26791)" },
      300: { value: "lab(85.1236% -.612259 -3.7138)" },
      400: { value: "lab(65.9269% -.832707 -8.17473)" },
      500: { value: "lab(47.7841% -.393182 -10.0268)" },
      600: { value: "lab(35.6337% -1.58697 -10.8425)" },
      700: { value: "lab(27.1134% -.956401 -12.3224)" },
      800: { value: "lab(16.1051% -1.18239 -11.7533)" },
      900: { value: "lab(8.11897% .811279 -12.254)" },
      950: { value: "lab(1.90334% .278696 -5.48866)" },
      ...getChakraColorSemanticDefaults("gray"),
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
    amber: {
      50: { value: "oklch(0.987 0.022 95.277)" },
      100: { value: "oklch(0.962 0.059 95.617)" },
      200: { value: "oklch(0.924 0.12 95.746)" },
      300: { value: "oklch(0.879 0.169 91.605)" },
      400: { value: "oklch(0.828 0.189 84.429)" },
      500: { value: "oklch(0.769 0.188 70.08)" },
      600: { value: "oklch(0.666 0.179 58.318)" },
      700: { value: "oklch(0.555 0.163 48.998)" },
      800: { value: "oklch(0.473 0.137 46.201)" },
      900: { value: "oklch(0.414 0.112 45.904)" },
      950: { value: "oklch(0.279 0.077 45.635)" },
      ...getChakraColorSemanticDefaults("amber"),
    },
    orange: {
      50: { value: "oklch(0.98 0.016 73.684)" },
      100: { value: "oklch(0.954 0.038 75.164)" },
      200: { value: "oklch(0.901 0.076 70.697)" },
      300: { value: "oklch(0.837 0.128 66.29)" },
      400: { value: "oklch(0.75 0.183 55.934)" },
      500: { value: "oklch(0.705 0.191 47.604)" },
      600: { value: "oklch(0.646 0.222 41.116)" },
      700: { value: "oklch(0.553 0.195 38.402)" },
      800: { value: "oklch(0.47 0.157 37.304)" },
      900: { value: "oklch(0.408 0.123 38.172)" },
      950: { value: "oklch(0.266 0.079 36.259)" },
      ...getChakraColorSemanticDefaults("orange"),
    },
    rose: {
      50: { value: "oklch(0.969 0.015 12.422)" },
      100: { value: "oklch(0.941 0.03 12.58)" },
      200: { value: "oklch(0.892 0.058 10.001)" },
      300: { value: "oklch(0.81 0.117 11.638)" },
      400: { value: "oklch(0.712 0.194 13.428)" },
      500: { value: "oklch(0.645 0.246 16.439)" },
      600: { value: "oklch(0.586 0.253 17.585)" },
      700: { value: "oklch(0.514 0.222 16.935)" },
      800: { value: "oklch(0.455 0.188 13.697)" },
      900: { value: "oklch(0.41 0.159 10.272)" },
      950: { value: "oklch(0.271 0.105 12.094)" },
      ...getChakraColorSemanticDefaults("rose"),
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
        value: { _light: "{colors.slate.800}", _dark: "{colors.slate.200}" },
      },
      subtle: {
        // 100 → 200
        // 900 → 800
        value: { _light: "{colors.slate.200}", _dark: "{colors.slate.800}" },
      },
      muted: {
        // 800 → 500
        value: { _light: "{colors.slate.400}", _dark: "{colors.slate.500}" },
      },
      emphasized: {
        value: { _light: "{colors.slate.300}", _dark: "{colors.slate.700}" },
      },
      solid: {
        value: { _light: "{colors.slate.900}", _dark: "{colors.white}" },
      },
      focusRing: {
        value: { _light: "{colors.slate.800}", _dark: "{colors.slate.200}" },
      },
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
