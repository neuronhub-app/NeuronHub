import { Flex, NumberInput, Stack, Switch, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { ids } from "@/e2e/ids";
import { useJobListFilters } from "@/sites/pg/pages/jobs/list/jobListFilters";

const textStyle = { ...facetStyle.value, color: "fg" } as const;

export function PgFacetSalary() {
  const filters = useJobListFilters();
  const state = useStateValtio({ localValue: "" });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // todo #prob-redundant — replaceable with uncontrolled input + key={salaryMin} for reset
  useEffect(() => {
    const synced = filters.snap.salaryMin != null ? String(filters.snap.salaryMin) : "";
    if (synced !== state.snap.localValue) {
      state.mutable.localValue = synced;
    }
  }, [filters.snap.salaryMin]);

  function handleValueChange(details: { valueAsNumber: number }) {
    const next = Number.isFinite(details.valueAsNumber) ? details.valueAsNumber : null;
    state.mutable.localValue = next != null ? String(next) : "";
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => {
      filters.mutable.salaryMin = next;
    }, 400);
  }

  return (
    <Stack gap="gap.sm">
      <NumberInput.Root
        value={state.snap.localValue}
        onValueChange={handleValueChange}
        size="xs"
        step={1000}
      >
        <NumberInput.Input
          placeholder="Minimum salary in USD (example: 50,000)"
          {...ids.set(ids.facet.salaryInput)}
        />
      </NumberInput.Root>

      <Text {...textStyle}>(All rates are annualized and converted to USD)</Text>

      <Switch.Root
        checked={filters.snap.excludeNoSalary}
        onCheckedChange={() => {
          filters.mutable.excludeNoSalary = !filters.mutable.excludeNoSalary;
        }}
        w="full"
        {...ids.set(ids.facet.switch.excludeNoSalary)}
      >
        <Switch.HiddenInput />
        <Flex w="full" justify="space-between" align="center" gap="gap.md">
          <Switch.Label {...textStyle}>Exclude roles without salary info</Switch.Label>
          <Switch.Control bg="brand.green.subtle" _checked={{ bg: "brand.green.light" }}>
            <Switch.Thumb />
          </Switch.Control>
        </Flex>
      </Switch.Root>
    </Stack>
  );
}
