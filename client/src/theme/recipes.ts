import { checkboxAnatomy } from "@ark-ui/react/checkbox";
import { segmentGroupAnatomy } from "@ark-ui/react/segment-group";
import { defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

export const recipes = {
  button: defineRecipe({
    variants: {
      variant: {
        // todo ? refac: move the state handler to voting-only, and keep the style "subtle-ghost"
        // todo ? refac: keep only subtle-ghost-v3
        // "subtle-ghost-v2" below is PoC of this
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
        "subtle-ghost-v2": {
          colorPalette: "slate",
          bg: "bg.transparent",
          borderRadius: "lg",
          color: { _light: "slate.400", _dark: "slate.500" },
          _hover: {
            color: { _light: "slate.500", _dark: "slate.200" },
            borderColor: { _light: "slate.500", _dark: "slate.200" },
            border: "sm",
          },
        },
        "subtle-ghost-v3": {
          colorPalette: "gray",
          bg: "bg.transparent",
          borderRadius: "md",
          px: "2.5px",
          h: "auto",
          color: { _light: "gray.400", _dark: "gray.500" },
          _hover: {
            color: "fg",
            bg: "bg.muted",
          },
        },
      },
    },
  }),
  input: defineRecipe({
    base: {
      _hover: {
        borderColor: "fg.subtle",
      },
    },
  }),
};

export const slotRecipes = {
  segmentGroup: defineSlotRecipe({
    slots: segmentGroupAnatomy.keys(),
    base: {
      item: {
        _hover: {
          cursor: "pointer",
          boxShadow: "inset",
        },
      },
    },
  }),
  checkbox: defineSlotRecipe({
    slots: checkboxAnatomy.keys(),
    base: {
      root: {
        _hover: {
          cursor: "pointer",
          borderColor: "fg.subtle",
        },
      },
      control: {
        _hover: {
          borderColor: "fg.subtle",
        },
      },
    },
  }),
};
