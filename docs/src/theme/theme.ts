import { createSystem, defaultConfig, defineConfig, mergeConfigs } from "@chakra-ui/react";
import { theme } from "@/theme/colors";

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      globalCss: {
        html: {
          colorPalette: "blue",
        },
      },
      theme: {
        semanticTokens: {
          colors: theme.colors,
        },
      },
    }),
  ),
);
