import type { ReactNode } from "react";
import type { UseRefinementListProps } from "react-instantsearch";
import type { TestId } from "@/e2e/ids";
import { PgFacetAttribute } from "@/sites/pg/components/PgFacetAttribute";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";

// todo ? refac: drop - PgFacetAttribute doesn't need to be in PgFacetPopover - they look as same component.
export function PgFacet(props: {
  label: string;
  attribute: string;
  order?: { base?: number; md?: number; lg?: number };
  icon?: ReactNode;
  isSearchEnabled?: boolean;
  subFacet?: { attribute: string; label: string };
  sortBy?: UseRefinementListProps["sortBy"];
  transformItems?: UseRefinementListProps["transformItems"];
  operator?: UseRefinementListProps["operator"];
  testId?: TestId;
}) {
  return (
    <PgFacetPopover
      label={props.label}
      attribute={props.attribute}
      order={props.order}
      icon={props.icon}
      testId={props.testId}
    >
      <PgFacetAttribute
        attribute={props.attribute}
        label={props.label}
        isSearchEnabled={props.isSearchEnabled}
        subFacet={props.subFacet}
        sortBy={props.sortBy}
        transformItems={props.transformItems}
        operator={props.operator}
      />
    </PgFacetPopover>
  );
}
