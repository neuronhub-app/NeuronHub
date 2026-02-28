import { Flex, NumberInput, Slider, Stack, Text } from "@chakra-ui/react";
import { useRange } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { format } from "@/utils/format";

// #AI
export function AlgoliaFacetSalary(props: { attribute: string; label: string }) {
  const rangeState = useRange({ attribute: props.attribute });

  if (!rangeState.canRefine) {
    return null;
  }

  const valueStart = rangeState.start[0];
  const range = {
    step: 1000,
    min: rangeState.range.min!,
    max: rangeState.range.max!,
    isActive: false,
  };

  const isActive = valueStart != null && Number.isFinite(valueStart) && valueStart > range.min!;
  const valueCurrent = isActive ? valueStart : range.min;
  range.isActive = isActive; // bad arrangement due to #bad-infer

  function refine(value: number) {
    if (value <= range.min) {
      rangeState.refine([range.min, range.max]);
    } else {
      const valueRounded = Math.round(value / range.step) * range.step;
      rangeState.refine([Math.min(valueRounded, range.max), range.max]);
    }
  }

  return (
    <Stack align="flex-start" gap="gap.sm">
      <Text {...facetStyle.label}>{props.label}</Text>

      <NumberInput.Root
        value={range.isActive ? String(valueCurrent) : ""}
        onValueChange={details => {
          if (Number.isFinite(details.valueAsNumber)) {
            refine(details.valueAsNumber);
          }
        }}
        size="xs"
        w="full"
        step={range.step}
        max={range.max}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      >
        <NumberInput.Input placeholder={`${format.money(range.min)}+`} />
      </NumberInput.Root>

      <Slider.Root
        w="full"
        size="sm"
        px="2px"
        min={range.min}
        max={range.max}
        step={range.step}
        value={[valueCurrent]}
        onValueChange={details => refine(details.value[0])}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} />
        </Slider.Control>
      </Slider.Root>

      <Flex w="full" justify="space-between" {...facetStyle.value} fontSize="2xs">
        <Text>{format.money(range.min)}</Text>
        <Text>{format.money(range.max)}</Text>
      </Flex>
    </Stack>
  );
}
