import { HStack, Stack, Tag, Text, Wrap } from "@chakra-ui/react";
import { fromUnixTime } from "date-fns";
import { useCallback } from "react";
import { LuX } from "react-icons/lu";
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { Button } from "@/components/ui/button";
import { datetime } from "@neuronhub/shared/utils/date-fns";

export function AlgoliaFacetsActive(props: {
  labelsOverride?: Record<string, string>;
  dateAttributes?: string[];
}) {
  const refinementsCurrent = useCurrentRefinements();

  const refinementsClear = useClearRefinements();

  const renderLabel = useCallback(renderLabelRaw, [props.dateAttributes, props.labelsOverride]);

  if (!refinementsClear.canRefine) {
    return null;
  }

  function renderLabelRaw(refinement: RefinementActive) {
    let label = props.labelsOverride?.[refinement.attribute] ?? refinement.label;

    if (props.dateAttributes?.includes(refinement.attribute)) {
      const date = fromUnixTime(refinement.value as number);
      label = `${label} ${refinement.operator} ${datetime.relative(date)}`;
    }
    return label;
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
                <Tag.Label>{renderLabel(refinement)}</Tag.Label>

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

type Refinements = ReturnType<typeof useCurrentRefinements>;
type Refinement = Refinements["items"][number];
type RefinementActive = Refinement["refinements"][number];
