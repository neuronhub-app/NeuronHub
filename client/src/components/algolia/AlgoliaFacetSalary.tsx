import { Flex, NumberInput, Slider, Stack, Text } from "@chakra-ui/react";
import { useRange } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { format } from "@neuronhub/shared/utils/format";

// #AI
export function AlgoliaFacetSalary(props: { attribute: string; label: string }) {
  const algoliaRange = useRange({ attribute: props.attribute });

  if (!algoliaRange.canRefine) {
    return null;
  }

  const valueStart = algoliaRange.start[0];
  const slider = {
    step: 1000,
    min: algoliaRange.range.min!,
    max: algoliaRange.range.max!,
    isActive: false,
  };

  const isActive = valueStart != null && Number.isFinite(valueStart) && valueStart > slider.min!; // #AI
  const valueCurrent = isActive ? valueStart : slider.min;
  slider.isActive = isActive; // badly code due to TS #bad-infer

  function refine(value: number) {
    if (value <= slider.min) {
      algoliaRange.refine([slider.min, slider.max]);
    } else {
      const valueRounded = Math.round(value / slider.step) * slider.step;
      algoliaRange.refine([Math.min(valueRounded, slider.max), slider.max]);
    }
  }

  return (
    <Stack align="flex-start" gap="gap.sm">
      <Text {...facetStyle.label}>{props.label}</Text>

      <NumberInput.Root
        value={slider.isActive ? String(valueCurrent) : ""}
        onValueChange={details => {
          if (Number.isFinite(details.valueAsNumber)) {
            refine(details.valueAsNumber);
          }
        }}
        size="xs"
        w="full"
        step={slider.step}
        max={slider.max}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      >
        <NumberInput.Input placeholder={`${format.money(slider.min)}+`} />
      </NumberInput.Root>

      <Slider.Root
        value={[valueCurrent, slider.max]}
        min={slider.min}
        max={slider.max}
        step={slider.step}
        onValueChange={details => refine(details.value[0])}
        thumbCollisionBehavior="push"
        size="sm"
        colorPalette="gray"
        w="full"
        px="3px"
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} />
        </Slider.Control>
      </Slider.Root>

      <Flex w="full" justify="space-between" px="1" color="fg.subtle" fontSize="2xs">
        <Text>{format.money(slider.min)}</Text>
        <Text>{format.money(slider.max)}</Text>
      </Flex>
    </Stack>
  );
}
