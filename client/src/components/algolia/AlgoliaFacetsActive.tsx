import { HStack, Stack, Tag, Text, Wrap } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { Button } from "@/components/ui/button";

export function AlgoliaFacetsActive(props: { toggleLabels?: Record<string, string> }) {
  const refinementsCurrent = useCurrentRefinements();

  const refinementsClear = useClearRefinements();

  if (!refinementsClear.canRefine) {
    return null;
  }

  return (
    <Stack gap="gap.sm">
      <HStack justify="space-between">
        <Text {...facetStyle.label}>Active Filters</Text>
        <Button onClick={() => refinementsClear.refine()} variant="outline" size="2xs">
          Reset all
        </Button>
      </HStack>
      <Wrap gap="gap.sm">
        {refinementsCurrent.items.flatMap(item =>
          item.refinements.map(refinement => {
            const label = props.toggleLabels?.[item.attribute] ?? refinement.label;
            return (
              <Tag.Root
                key={`${item.attribute}-${refinement.label}`}
                size="sm"
                variant="subtle"
                colorPalette="gray"
                cursor="pointer"
                onClick={() => item.refine(refinement)}
                _hover={{ bg: "bg.emphasized" }}
                transition="backgrounds"
                css={{ "&:hover .close-icon": { color: "red" } }}
              >
                <Tag.Label>{label}</Tag.Label>
                <Tag.EndElement>
                  <LuX className="close-icon" />
                </Tag.EndElement>
              </Tag.Root>
            );
          }),
        )}
      </Wrap>
    </Stack>
  );
}
