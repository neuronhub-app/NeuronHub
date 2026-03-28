import { createListCollection, Select } from "@chakra-ui/react";
import { useSortBy } from "react-instantsearch";

export function PgAlgoliaSortSelect(props: { items: Array<{ value: string; label: string }> }) {
  const sort = useSortBy({ items: props.items });
  const collection = createListCollection({ items: props.items });

  return (
    <Select.Root
      collection={collection}
      value={[sort.currentRefinement]}
      onValueChange={details => sort.refine(details.value[0]!)}
      variant="ghost"
      size="xs"
      w="fit-content"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          ps="0"
          fontWeight="500"
          fontSize="sm"
          bg="bg"
          color="brand.black"
          cursor="pointer"
          _hover={{ bg: "bg" }}
          _focusVisible={{ outline: "none", boxShadow: "none" }}
        >
          <Select.ValueText />
          <Select.Indicator ms="gap.sm" color="brand.black" />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content
          bg="bg"
          borderColor="fg"
          borderWidth="1px"
          borderRadius="sm"
          p="3"
          w="fit-content"
          minW="unset"
        >
          {collection.items.map(item => (
            <Select.Item
              key={item.value}
              item={item}
              fontSize="sm"
              color="fg"
              cursor="pointer"
              bg="transparent"
              _highlighted={{ bg: "transparent", color: "brand.green.light" }}
            >
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}
