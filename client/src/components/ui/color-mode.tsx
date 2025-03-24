"use client";

import { Button } from "@/components/ui/button";
import type { IconButtonProps } from "@chakra-ui/react";
import { ClientOnly, Skeleton } from "@chakra-ui/react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? light : dark;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "light" ? <LuSun /> : <LuMoon />;
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();
  const { colorMode } = useColorMode();
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
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </Button>
    </ClientOnly>
  );
});
