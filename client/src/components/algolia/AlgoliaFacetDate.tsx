import { Checkbox, For, Stack, Text } from "@chakra-ui/react";
import { getUnixTime, subDays, subMonths, subYears } from "date-fns";
import { useMemo } from "react";
import { useNumericMenu } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";

const DEFAULT_ITEMS = [
  { label: "1d", sub: (now: Date) => subDays(now, 1) },
  { label: "7d", sub: (now: Date) => subDays(now, 7) },
  { label: "30d", sub: (now: Date) => subDays(now, 30) },
  { label: "6m", sub: (now: Date) => subMonths(now, 6) },
  { label: "1y", sub: (now: Date) => subYears(now, 1) },
  { label: "2y", sub: (now: Date) => subYears(now, 2) },
] as const;

// #AI
export function AlgoliaFacetDate(props: { attribute: string; label: string }) {
  const now = useMemo(() => new Date(), []);
  const items = useMemo(
    () => [
      ...DEFAULT_ITEMS.map(item => ({
        label: item.label,
        start: getUnixTime(item.sub(now)),
      })),
      { label: "All" },
    ],
    [now],
  );

  const menu = useNumericMenu({ attribute: props.attribute, items });

  return (
    <Stack align="flex-start">
      <Text {...facetStyle.label}>{props.label}</Text>
      <Stack gap="gap.sm">
        <For each={menu.items}>
          {item => (
            <Checkbox.Root
              key={item.label}
              checked={item.isRefined}
              onCheckedChange={() => menu.refine(item.value)}
              display="flex"
              alignItems="center"
              size="sm"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label {...facetStyle.value}>{item.label}</Checkbox.Label>
            </Checkbox.Root>
          )}
        </For>
      </Stack>
    </Stack>
  );
}
