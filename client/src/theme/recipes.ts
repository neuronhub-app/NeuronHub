import { defineRecipe } from "@chakra-ui/react";

export const recipes = {
  button: defineRecipe({
    variants: {
      variant: {
        "subtle-ghost": {
          colorPalette: "slate",
          bg: "bg.transparent",
          borderRadius: "lg",
          color: { _light: "slate.300", _dark: "slate.500" },
          _hover: {
            color: { _light: "slate.500", _dark: "slate.200" },
            bg: { _light: "slate.200", _dark: "slate.500" },
          },

          "&[data-state=checked]": {
            color: { _light: "white", _dark: "slate.100" },
            bg: { _light: "slate.400", _dark: "slate.700" },
            _hover: {
              color: { _light: "slate.100", _dark: "slate.200" },
              bg: { _light: "slate.300", _dark: "slate.800" },
            },
          },
        },
      },
    },
  }),
};
