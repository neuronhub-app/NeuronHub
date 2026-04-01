"use client";

import type { IconButtonProps } from "@chakra-ui/react";
import { ClientOnly, Skeleton } from "@chakra-ui/react";
import { icons } from "@neuronhub/shared/theme/icons";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider, useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}

export function useColorMode() {
  const { setTheme, theme } = useTheme();
  return {
    colorMode: theme,

    setColorMode: setTheme,

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

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? light : dark;
}

export function ColorModeIcon() {
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

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    return (
      <ClientOnly fallback={<Skeleton boxSize="8" />}>
        <Button
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
          ref={ref}
          variant="ghost"
          colorPalette="gray"
          {...props}
          css={{
            _icon: {
              boxSize: { base: 4, xl: 5 },
            },
          }}
        >
          <ColorModeIcon />
        </Button>
      </ClientOnly>
    );
  },
);
