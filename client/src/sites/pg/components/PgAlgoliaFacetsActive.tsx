import { Badge, HStack, Icon, Text, Wrap } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { fromUnixTime } from "date-fns";

import { LuX } from "react-icons/lu";
import { useClearRefinements, useCurrentRefinements } from "react-instantsearch";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { salaryFormatter } from "@/sites/pg/components/PgFacetSalary";

export type RefinementActive = ReturnType<
  typeof useCurrentRefinements
>["items"][number]["refinements"][number];

const tagStyle = {
  bg: "#F7F7F7",
  borderWidth: "1px",
  borderColor: "brand.gray",
  borderRadius: "sm",
  h: "6",
  pl: "gap.sm",
  pr: "gap.xs",
  fontSize: "sm",
  color: "#908989",
  cursor: "pointer",
  css: { "&:hover .close-icon": { color: "red" } },
} as const;

export type FacetsActiveConfig = {
  labelsOverride?: Record<string, string>;
  dateAttributes?: string[];
  moneyAttributes?: string[];
  formatAttribute?: Record<string, (refinement: RefinementActive) => string>;
  subFacetPairs?: Record<string, string>;
  subFacetLabel?: Record<string, string>;
  extraTags?: Array<{ label: string; onRemove: () => void }>;
  onClearAdditional?: () => void;
};

export function PgAlgoliaFacetsActive(props: {
  config: FacetsActiveConfig;
  tagsGap?: string;
  children?: ReactNode;
}) {
  const refinementsCurrent = useCurrentRefinements();
  const refinementsClear = useClearRefinements();

  if (!refinementsClear.canRefine && !props.config.extraTags?.length) {
    return null;
  }

  function isSubFacetHidden(attribute: string, label: string) {
    const mainAttr = props.config.subFacetPairs?.[attribute];
    if (!mainAttr) {
      return false;
    }
    return (
      refinementsCurrent.items
        .find(item => item.attribute === mainAttr)
        ?.refinements.some(refinement => refinement.label === label) ?? false
    );
  }

  function renderLabel(attribute: string, refinement: RefinementActive) {
    if (props.config.subFacetPairs?.[attribute] !== undefined) {
      return `${refinement.label} (${props.config.subFacetLabel?.[attribute] ?? attribute})`;
    }

    const label = props.config.labelsOverride?.[attribute] ?? refinement.label;
    if (props.config.dateAttributes?.includes(attribute)) {
      return `${label} ${refinement.operator} ${datetime.relative(fromUnixTime(refinement.value as number))}`;
    }
    if (props.config.moneyAttributes?.includes(attribute)) {
      return `${label}: ${salaryFormatter.format(refinement.value as number)}+`;
    }
    return props.config.formatAttribute?.[attribute]?.(refinement) ?? label;
  }

  return (
    <Wrap gap={props.tagsGap ?? "gap.md"}>
      {refinementsCurrent.items.flatMap(item =>
        item.refinements
          .filter(refinement => !isSubFacetHidden(item.attribute, refinement.label))
          .map(refinement => (
            <FilterTag
              key={`${item.attribute}-${refinement.label}`}
              label={renderLabel(item.attribute, refinement)}
              onRemove={() => item.refine(refinement)}
            />
          )),
      )}
      {props.config.extraTags?.map(tag => (
        <FilterTag key={tag.label} label={tag.label} onRemove={tag.onRemove} />
      ))}
      {props.children}
    </Wrap>
  );
}

function FilterTag(props: { label: string; onRemove: () => void }) {
  return (
    <Badge {...tagStyle} onClick={props.onRemove} maxW="full">
      <HStack gap="gap.xs" alignItems="center" overflow="hidden">
        <Text truncate>{props.label}</Text>
        <Icon boxSize="2.5" color="inherit" className="close-icon">
          <LuX />
        </Icon>
      </HStack>
    </Badge>
  );
}
