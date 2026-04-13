import { Flex, Grid, Stack, Switch } from "@chakra-ui/react";
import type { UseRefinementListProps } from "react-instantsearch";
import { useRefinementList, useToggleRefinement } from "react-instantsearch";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { ids } from "@/e2e/ids";
import { PgFacet } from "@/sites/pg/components/PgFacet";
import { ALGOLIA_ATTR_LOCATION, PgFacetLocation } from "@/sites/pg/components/PgFacetLocation";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";
import { PgFacetSalary } from "@/sites/pg/components/PgFacetSalary";
import { LocationType } from "~/graphql/enums";

const sortAlpha = ["name:asc", "count:desc"] satisfies UseRefinementListProps["sortBy"];

export function PgFiltersTopbar() {
  const attr = {
    causeArea: "tags_area.name",
    roleType: "tags_workload.name",
    experience: "tags_experience.name",
    skillSet: "tags_skill.name",
    education: "tags_education.name",
  } as const;

  const locationFilters = useRefinementList({
    attribute: ALGOLIA_ATTR_LOCATION,
    limit: 200,
    operator: "or",
  });

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
      columnGap="gap.md"
      rowGap={{ base: "3.5", md: "2" }}
    >
      <PgFacet
        label="Cause Area"
        attribute={attr.causeArea}
        order={{ base: 1 }}
        sortBy={sortAlpha}
        testId={ids.facet.popover.causeArea}
      />

      <PgFacet
        label="Skill Set"
        attribute={attr.skillSet}
        order={{ base: 2, md: 3, lg: 2 }}
        isSearchEnabled
        sortBy={sortAlpha}
      />

      <PgFacet
        label="Experience"
        attribute={attr.experience}
        order={{ base: 3, md: 5, lg: 3 }}
        transformItems={items =>
          sortByCustomOrder(items, [
            "Entry-Level",
            "Junior (1–4y)",
            "Mid (5–9y)",
            "Senior (10y+)",
          ])
        }
      />

      <PgFacet
        label="Education"
        attribute={attr.education}
        order={{ base: 4, md: 7, lg: 4 }}
        transformItems={items =>
          sortByCustomOrder(items, [
            "Undergraduate Degree or Less",
            "Master's Degree",
            "Doctoral Degree",
          ])
        }
      />

      <PgFacet
        label="Role Type"
        attribute={attr.roleType}
        order={{ base: 5, md: 9, lg: 5 }}
        transformItems={items =>
          sortByCustomOrder(items, [
            "Full-Time",
            "Part-Time (50–80% FTE)",
            "Part-Time (<50% FTE)",
            "Internship",
            "Fellowship",
            "Volunteer",
            "Funding",
            "Training",
            "Graduate Program",
            "Expression of Interest",
          ])
        }
      />

      <PgFacetLocation
        label="Remote"
        type={LocationType.Remote}
        refine={locationFilters.refine}
        algoliaItems={locationFilters.items}
        order={{ base: 6, md: 2, lg: 6 }}
        testId={ids.facet.popover.remote}
      />

      <PgFacetLocation
        label="Country"
        type={LocationType.Country}
        refine={locationFilters.refine}
        algoliaItems={locationFilters.items}
        order={{ base: 7, md: 4, lg: 7 }}
        isSearchEnabled
        testId={ids.facet.popover.country}
      />

      <PgFacetLocation
        label="City"
        type={LocationType.City}
        refine={locationFilters.refine}
        algoliaItems={locationFilters.items}
        order={{ base: 8, md: 6, lg: 8 }}
        isSearchEnabled
        testId={ids.facet.popover.city}
      />

      <PgFacetPopover
        label="Salary"
        order={{ base: 9, md: 8, lg: 9 }}
        testId={ids.facet.popover.salary}
      >
        <PgFacetSalary />
      </PgFacetPopover>

      <OtherFiltersFacet />
    </Grid>
  );
}

function OtherFiltersFacet() {
  const highlighted = useToggleRefinement({ attribute: "is_orgs_highlighted" });
  const notCareerCapital = useToggleRefinement({ attribute: "is_not_career_capital" });
  const notProfitForGood = useToggleRefinement({ attribute: "is_not_profit_for_good" });

  return (
    <PgFacetPopover
      label="Other Filters"
      order={{ base: 10 }}
      testId={ids.facet.popover.otherFilters}
    >
      <Stack gap="gap.sm">
        <BooleanSwitch
          label="Show only roles at highlighted orgs"
          checked={highlighted.value.isRefined}
          onToggle={() => highlighted.refine(highlighted.value)}
        />
        <BooleanSwitch
          label="Exclude career-capital roles"
          checked={notCareerCapital.value.isRefined}
          onToggle={() => notCareerCapital.refine(notCareerCapital.value)}
          testId={ids.facet.excludeCareerCapital}
        />
        <BooleanSwitch
          label="Exclude Profit-for-Good roles"
          checked={notProfitForGood.value.isRefined}
          onToggle={() => notProfitForGood.refine(notProfitForGood.value)}
        />
      </Stack>
    </PgFacetPopover>
  );
}

function BooleanSwitch(props: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  testId?: string;
}) {
  return (
    <Switch.Root
      checked={props.checked}
      onCheckedChange={props.onToggle}
      data-testid={props.testId}
    >
      <Switch.HiddenInput />
      <Flex w="full" justify="space-between" align="center" gap="gap.md">
        <Switch.Label {...facetStyle.value}>{props.label}</Switch.Label>
        <Switch.Control bg="brand.green.subtle" _checked={{ bg: "brand.green.light" }}>
          <Switch.Thumb />
        </Switch.Control>
      </Flex>
    </Switch.Root>
  );
}

function sortByCustomOrder<Val, T extends { label: Val }>(items: T[], orderAs: Val[]): T[] {
  return items.toSorted((a, b) => {
    const indexA = orderAs.indexOf(a.label);
    const indexB = orderAs.indexOf(b.label);
    if (indexA === -1 && indexB === -1) {
      return 0;
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  });
}
