import { Flex, Icon } from "@chakra-ui/react";
import { LuSquareX } from "react-icons/lu";
import { useClearRefinements } from "react-instantsearch";

export function PgAlgoliaClearButton(props: {
  onClear?: () => void;
  extraTags?: Array<{ label: string; onRemove: () => void }>;
}) {
  const refinementsClear = useClearRefinements();

  if (!refinementsClear.canRefine && !props.extraTags?.length) {
    return null;
  }

  return (
    <Flex
      as="button"
      onClick={() => {
        refinementsClear.refine();
        props.onClear?.();
      }}
      align="center"
      gap="gap.xs"
      color="brand.green"
      fontSize="sm"
      fontWeight="medium"
      cursor="pointer"
      _hover={{ color: "brand.green.light" }}
      whiteSpace="nowrap"
      h="6"
    >
      <Icon boxSize="3.5">
        <LuSquareX />
      </Icon>
      Clear all
    </Flex>
  );
}
