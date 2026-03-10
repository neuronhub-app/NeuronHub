import { Checkbox, Input, Stack, Text, useToken } from "@chakra-ui/react";
import { useRefinementList } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { Button } from "@/components/ui/button";

export function AlgoliaFacetAttribute(props: {
  attribute: string;
  label: string;
  isSearchEnabled?: boolean;
  showFirst?: number;
  subFacet?: { attribute: string; label: string };
}) {
  const refinements = useRefinementList({
    attribute: props.attribute,
    limit: props.showFirst ?? 10,
    showMore: true,
  });
  const subRefinements = useRefinementList({
    attribute: props.subFacet?.attribute ?? props.attribute,
  });

  const countStyle = {
    color: useToken("colors", "fg.subtle")[0],
    fontSize: useToken("fontSizes", "2xs")[0],
  };

  return (
    <Stack align="flex-start">
      <Text {...facetStyle.label}>{props.label}</Text>

      {props.isSearchEnabled && (
        <Input
          onChange={event => refinements.searchForItems(event.target.value)}
          type="search"
          placeholder="Search..."
          size="xs"
        />
      )}

      {refinements.items.length === 0 && (
        <Text color="fg.subtle" fontSize="sm">
          No results
        </Text>
      )}

      <Stack gap="gap.sm">
        {refinements.items.map(item => {
          // #AI
          const subItemsByValue = props.subFacet
            ? new Map(subRefinements.items.map(item => [item.value, item]))
            : undefined;
          const subItem = subItemsByValue?.get(item.value);
          return (
            <Stack key={item.value} gap="gap.sm">
              <FacetCheckboxItem
                item={item}
                countStyle={countStyle}
                onRefine={() => refinements.refine(item.value)}
              />
              {subItem && (
                <FacetCheckboxItem
                  item={subItem}
                  countStyle={countStyle}
                  labelOverride={props.subFacet!.label}
                  onRefine={() => subRefinements.refine(subItem.value)}
                  ps="5"
                />
              )}
            </Stack>
          );
        })}
      </Stack>

      {refinements.canToggleShowMore && (
        <Button
          onClick={() => refinements.toggleShowMore()}
          variant="subtle-ghost-v3"
          size="2xs"
        >
          {refinements.isShowingMore ? "Collapse" : "Show more"}
        </Button>
      )}
    </Stack>
  );
}

function FacetCheckboxItem(props: {
  item: { value: string; isRefined: boolean; highlighted?: string; count: number };
  countStyle: { color: string; fontSize: string };
  onRefine: () => void;
  labelOverride?: string;
  ps?: string;
}) {
  return (
    <Checkbox.Root
      checked={props.item.isRefined}
      onCheckedChange={props.onRefine}
      display="flex"
      alignItems="flex-start"
      ps={props.ps}
      size="sm"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label {...facetStyle.value} mt="-3px">
        <Text
          // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
          dangerouslySetInnerHTML={{
            __html:
              (props.labelOverride ?? props.item.highlighted!) +
              `&nbsp;<span style="margin-left: 1px; font-size: ${props.countStyle.fontSize}; color: ${props.countStyle.color}">${props.item.count}</span>`,
          }}
          as="span"
        />{" "}
      </Checkbox.Label>
    </Checkbox.Root>
  );
}
