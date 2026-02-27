import { Checkbox, Text } from "@chakra-ui/react";
import { useToggleRefinement } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";

export function AlgoliaFacetBoolean(props: { attribute: string; label: string }) {
  const toggleFacet = useToggleRefinement({ attribute: props.attribute, on: true });

  return (
    <Checkbox.Root
      checked={toggleFacet.value.isRefined}
      onCheckedChange={() => toggleFacet.refine(toggleFacet.value)}
      display="flex"
      alignItems="center"
      size="sm"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label {...facetStyle.value} gap="1">
        {props.label}
        <Text as="span" color="fg.subtle" fontSize="2xs" mt="1px">
          {toggleFacet.value.onFacetValue.count ?? 0}
        </Text>
      </Checkbox.Label>
    </Checkbox.Root>
  );
}
