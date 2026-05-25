// typegen-only: unions NHA + pg + chakra-default recipe variants in one typegen pass.
// Per-recipe variant merge prevents pg's stripped overrides (link, container) from dropping chakra defaults like `<Link variant="underline">`.
import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  mergeConfigs,
} from "@chakra-ui/react";

import { pgRecipes } from "@/sites/pg/theme";
import { slotRecipes } from "@/theme/recipes";

const chakraRecipes = defaultConfig.theme?.recipes;

const recipesForTypegen = Object.fromEntries(
  Object.entries(pgRecipes).map(([name, pgRecipe]) => {
    const chakraRecipe = chakraRecipes?.[name as keyof typeof chakraRecipes];
    return [
      name,
      // @ts-expect-error #bad-infer recipe types diverge per name; typegen-only, runtime never reads this
      defineRecipe({
        ...chakraRecipe,
        ...pgRecipe,
        variants: {
          ...chakraRecipe?.variants,
          ...pgRecipe.variants,
          variant: {
            ...chakraRecipe?.variants?.variant,
            ...pgRecipe.variants?.variant,
          },
        },
      }),
    ];
  }),
);

export const system = createSystem(
  mergeConfigs(
    defaultConfig,
    defineConfig({
      theme: { recipes: recipesForTypegen, slotRecipes },
    }),
  ),
);
