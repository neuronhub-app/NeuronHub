import { createSystem, defaultConfig, defineConfig, mergeConfigs } from "@chakra-ui/react";
import { theme } from "@neuronhub/shared/theme/colors";
import { gap } from "@neuronhub/shared/theme/spacings";

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      theme: {
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
