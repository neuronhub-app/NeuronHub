/**
 * #quality-25% #155 — see [[jobListFilters.ts]]
 */
import { Flex, NumberInput, Stack, Switch, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { ids } from "@/e2e/ids";
import { useJobListFilters } from "@/sites/pg/pages/jobs/list/jobListFilters";

const textStyle = { ...facetStyle.value, color: "fg" } as const;

export function PgFacetSalary() {
  const filters = useJobListFilters();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleValueChange(details: { valueAsNumber: number }) {
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      filters.mutable.salaryMin = Number.isFinite(details.valueAsNumber)
        ? details.valueAsNumber
        : null;
    }, 400);
  }

  return (
    <Stack gap="gap.sm">
      <NumberInput.Root
        key={filters.snap.salaryMin ?? "empty"}
        defaultValue={filters.snap.salaryMin != null ? String(filters.snap.salaryMin) : ""}
        onValueChange={handleValueChange}
        size="xs"
        step={1000}
        formatOptions={{ useGrouping: true }}
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
          filters.mutable.excludeNoSalary = !filters.snap.excludeNoSalary;
        }}
        w="full"
        {...ids.set(ids.facet.excludeNoSalary)}
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
