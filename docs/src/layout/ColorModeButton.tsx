"use client";

import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import { useTheme } from "next-themes";

import { icons } from "@neuronhub/shared/theme/icons";

import { ids } from "@/e2e/ids";

function useColorMode() {
  const { setTheme, theme } = useTheme();
  return {
    colorMode: theme,

    toggleColorMode: () => {
      switch (theme) {
        case "system":
          return setTheme("dark");
        case "light":
          return setTheme("system");
        case "dark":
          return setTheme("light");
      }
    },
  };
}

function ColorModeIcon() {
  const { colorMode } = useColorMode();

  switch (colorMode) {
    case "system":
      return <icons.mode_system />;
    case "light":
      return <icons.mode_light />;
    case "dark":
      return <icons.mode_dark />;
  }
}

export function ColorModeButton() {
  const { toggleColorMode } = useColorMode();

  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        {...ids.set(ids.sidebar.colorMode)}
        onClick={toggleColorMode}
        aria-label="Toggle color mode"
        variant="ghost"
        colorPalette="gray"
        size="md"
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  );
}
