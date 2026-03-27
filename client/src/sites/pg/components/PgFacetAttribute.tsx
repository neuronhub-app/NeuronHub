import { Checkbox, Flex, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { LuX } from "react-icons/lu";
import { useRefinementList } from "react-instantsearch";
import type { UseRefinementListProps } from "react-instantsearch";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

const style = {
  label: { fontSize: "13px", color: "fg", _groupHover: { color: "brand.green.light" } },
  count: { fontSize: "13px", color: "fg.muted", _groupHover: { color: "brand.green.light" } },
} as const;

export function PgFacetAttribute(props: {
  attribute: string;
  label: string;
  isSearchEnabled?: boolean;
  subFacet?: { attribute: string; label: string };
  allowedValues?: string[];
  sortBy?: UseRefinementListProps["sortBy"];
  transformItems?: UseRefinementListProps["transformItems"];
  operator?: UseRefinementListProps["operator"];
}) {
  type FacetItem = ReturnType<typeof useRefinementList>["items"][number];

  const facetValuesInitialRef = useRef<Map<string, FacetItem>>(new Map());
  const searchQueryRef = useRef("");

  const refinements = useRefinementList({
    attribute: props.attribute,
    limit: 1000,
    sortBy: props.sortBy ?? ["count:desc", "name:asc"],
    operator: props.operator,
    // Keep <Checkbox>s order fixed - don't move selected on top, and don't hide count=0.
    // Refs #137, ENG-56
    transformItems: useCallback(
      (items: FacetItem[], metadata) => {
        const applyTransform = (fixed: FacetItem[]) =>
          props.transformItems ? props.transformItems(fixed, metadata) : fixed;

        if (props.allowedValues) {
          const algoliaValues = new Set(items.map(item => item.value));
          const fixed = [...items];
          const query = searchQueryRef.current.toLowerCase();
          for (const value of props.allowedValues) {
            if (!algoliaValues.has(value) && (!query || value.toLowerCase().includes(query))) {
              fixed.push({
                value,
                label: value,
                count: 0,
                isRefined: false,
                highlighted: value,
              } as FacetItem);
            }
          }
          return applyTransform(fixed);
        }

        const result = new Map(facetValuesInitialRef.current);
        for (const facetValue of result.values()) {
          result.set(facetValue.value, { ...facetValue, count: 0 });
        }
        for (const item of items) {
          result.set(item.value, item);
        }
        facetValuesInitialRef.current = result;
        return applyTransform(Array.from(result.values()));
      },
      [props.transformItems, props.allowedValues],
    ),
  });
  const subRefinements = useRefinementList({
    attribute: props.subFacet?.attribute ?? props.attribute,
  });
  const state = useStateValtio({ query: "" });

  function search(value: string) {
    state.mutable.query = value;
    searchQueryRef.current = value;
    refinements.searchForItems(value);
  }

  function refineMain(itemValue: string, isCurrentlyRefined: boolean) {
    refinements.refine(itemValue);
    if (props.subFacet) {
      const subItem = subRefinements.items.find(
        subRefinement => subRefinement.value === itemValue,
      );
      if (subItem && subItem.isRefined === isCurrentlyRefined) {
        subRefinements.refine(itemValue);
      }
    }
    search("");
  }

  function refineSub(itemValue: string) {
    subRefinements.refine(itemValue);
    search("");
  }

  return (
    <Stack align="flex-start">
      {props.isSearchEnabled && (
        <InputGroup
          endElement={
            state.snap.query && (
              <Icon
                as={LuX}
                onClick={() => search("")}
                boxSize="3"
                color="fg.muted"
                cursor="pointer"
              />
            )
          }
        >
          <Input
            value={state.snap.query}
            onChange={event => search(event.target.value)}
            type="search"
            placeholder="Search..."
            size="xs"
            _focus={{ borderWidth: "1px", borderColor: "brand.green" }}
          />
        </InputGroup>
      )}

      {refinements.items.length === 0 && (
        <Text color="fg.muted" fontSize="sm">
          No results
        </Text>
      )}

      <Stack gap="gap.sm" w="full">
        {refinements.items
          .filter(
            item =>
              item.value !== "Other" &&
              (!props.allowedValues || props.allowedValues.includes(item.label)),
          )
          .map(item => {
            const subItem = props.subFacet
              ? subRefinements.items.find(subRefinement => subRefinement.value === item.value)
              : undefined;
            return (
              <Stack key={item.value} gap="gap.sm">
                <FacetCheckboxItem
                  item={item}
                  onRefine={() => refineMain(item.value, item.isRefined)}
                />
                {subItem && (
                  <FacetCheckboxItem
                    item={{ ...subItem, isRefined: subItem.isRefined || item.isRefined }}
                    labelOverride={props.subFacet!.label}
                    onRefine={() => refineSub(item.value)}
                    isSubItem
                    disabled={item.isRefined}
                  />
                )}
              </Stack>
            );
          })}
      </Stack>
    </Stack>
  );
}

function FacetCheckboxItem(props: {
  item: {
    value: string;
    isRefined: boolean;
    highlighted?: string;
    label: string;
    count: number;
  };
  onRefine: () => void;
  labelOverride?: string;
  isSubItem?: boolean;
  disabled?: boolean;
}) {
  const checkbox = (
    <Checkbox.Root
      checked={props.item.isRefined}
      onCheckedChange={props.onRefine}
      size="sm"
      display="grid"
      gridTemplateColumns="auto 1fr auto"
      gap="gap.sm"
      flex="1"
      opacity={props.disabled ? 0.5 : 1}
      cursor={props.disabled ? "not-allowed" : "pointer"}
      className="group"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control _groupHover={{ borderColor: "brand.green.light" }} />
      <Text
        {...style.label}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
        dangerouslySetInnerHTML={{
          __html: props.labelOverride ?? props.item.highlighted ?? props.item.label,
        }}
      />
      <Text {...style.count}>{props.item.count}</Text>
    </Checkbox.Root>
  );

  if (props.isSubItem) {
    return (
      <Flex align="center" gap="gap.sm">
        <Text color="brand.gray" fontSize="xs" w="4">
          └
        </Text>
        {checkbox}
      </Flex>
    );
  }

  return checkbox;
}
