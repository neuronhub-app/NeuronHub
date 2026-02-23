import { For, RadioGroup, Stack, Text } from "@chakra-ui/react";
import {
  addDays,
  addMonths,
  addYears,
  getUnixTime,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { useMemo } from "react";
import { useNumericMenu } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";

/**
 * Algolia BE is unaware of `Date` type - this is a `number` filter.
 *
 * Algolia uses type: `{start?: number; end?: number}`
 */
export function AlgoliaFacetDate(props: {
  attribute: string;
  label: string;
  isFuture?: boolean;
}) {
  const dateNow = useMemo(() => new Date(), []);

  const choices = useMemo(() => {
    let choices = choicesDateAgo;
    if (props.isFuture) {
      choices = choicesDateAfter;
    }
    // todo ? refac: 2-step for..in or map()
    return [
      ...choices.map(item => ({
        label: item.label,
        [props.isFuture ? "end" : "start"]: getUnixTime(item.calcDate(dateNow)),
      })),
      { label: "All" },
    ];
  }, [dateNow, props.isFuture]);

  const menuNumeric = useNumericMenu({ attribute: props.attribute, items: choices });

  return (
    <Stack align="flex-start">
      <Text {...facetStyle.label}>{props.label}</Text>
      <RadioGroup.Root
        onValueChange={details => menuNumeric.refine(details.value ?? "")}
        value={menuNumeric.items.find(i => i.isRefined)?.value}
      >
        <Stack gap="gap.sm">
          <For each={menuNumeric.items}>
            {item => (
              <RadioGroup.Item key={item.value} value={item.value}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>
                  {renderLabel(item, { isFuture: props.isFuture })}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            )}
          </For>
        </Stack>
      </RadioGroup.Root>
    </Stack>
  );
}

function renderLabel(
  item: { value: string; label: string },
  opts: { isFuture?: boolean },
): string {
  const valueRaw = decodeURI(item.value);
  // yeah, Algolia's JS is wild
  const value = JSON.parse(valueRaw) as { start?: number; end?: number };
  const isNonDefault = value.start || value.end;

  if (!opts.isFuture && isNonDefault) {
    return `${item.label} ago`;
  }
  return item.label;
}

// todo ? refac: generate based on Array<label> & props.isFuture

const choicesDateAgo = [
  { label: "1d", calcDate: (now: Date) => subDays(now, 1) },
  { label: "7d", calcDate: (now: Date) => subDays(now, 7) },
  { label: "30d", calcDate: (now: Date) => subDays(now, 30) },
  { label: "6m", calcDate: (now: Date) => subMonths(now, 6) },
  { label: "1y", calcDate: (now: Date) => subYears(now, 1) },
] as const;

const choicesDateAfter = [
  { label: "1d", calcDate: (now: Date) => addDays(now, 1) },
  { label: "7d", calcDate: (now: Date) => addDays(now, 7) },
  { label: "30d", calcDate: (now: Date) => addDays(now, 30) },
  { label: "6m", calcDate: (now: Date) => addMonths(now, 6) },
  { label: "1y", calcDate: (now: Date) => addYears(now, 1) },
] as const;
