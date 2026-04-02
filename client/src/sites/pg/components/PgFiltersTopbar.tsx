import { Flex, Grid, Stack, Switch } from "@chakra-ui/react";
import { useToggleRefinement } from "react-instantsearch";
import { proxy, useSnapshot } from "valtio";
import { PgFacetSalary } from "@/sites/pg/components/PgFacetSalary";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import type { UseRefinementListProps } from "react-instantsearch";
import { PgFacetAttribute } from "@/sites/pg/components/PgFacetAttribute";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";
import { ids } from "@/e2e/ids";
import { LuMapPin } from "react-icons/lu";

export const otherFiltersState = proxy({
  excludeCareerCapital: false,
  excludeProfitForGood: false,
});

export function resetOtherFilters() {
  otherFiltersState.excludeCareerCapital = false;
  otherFiltersState.excludeProfitForGood = false;
}

const sortAlpha = ["name:asc", "count:desc"] satisfies UseRefinementListProps["sortBy"];

export function PgFiltersTopbar() {
  const attr = {
    causeArea: "tags_area.name",
    roleType: "tags_workload.name",
    experience: "tags_experience.name",
    skillSet: "tags_skill.name",
    remote: "locations.remote_name",
    country: "locations.country",
    city: "locations.city",
    education: "tags_education.name",
  } as const;

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
      columnGap="gap.md"
      rowGap={{ base: "3.5", md: "2" }}
    >
      <PgFacetPopover label="Cause Area" attribute={attr.causeArea} order={{ base: 1, lg: 1 }}>
        <PgFacetAttribute attribute={attr.causeArea} label="Cause Area" sortBy={sortAlpha} />
      </PgFacetPopover>

      <PgFacetPopover label="Role Type" attribute={attr.roleType} order={{ base: 3, lg: 2 }}>
        <PgFacetAttribute
          attribute={attr.roleType}
          label="Role Type"
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
      </PgFacetPopover>

      <PgFacetPopover label="Experience" attribute={attr.experience} order={{ base: 7, lg: 3 }}>
        <PgFacetAttribute
          attribute={attr.experience}
          label="Experience"
          transformItems={items =>
            sortByCustomOrder(items, [
              "Entry–Level",
              "Junior (1–4y)",
              "Mid (5–9y)",
              "Senior (10y+)",
            ])
          }
        />
      </PgFacetPopover>

      <PgFacetPopover
        label="Salary"
        order={{ base: 9, lg: 4 }}
        testId={ids.facet.popover.salary}
      >
        <PgFacetSalary />
      </PgFacetPopover>

      <PgFacetPopover label="Skill Set" attribute={attr.skillSet} order={{ base: 2, lg: 5 }}>
        <PgFacetAttribute
          attribute={attr.skillSet}
          label="Skill Set"
          isSearchEnabled
          sortBy={sortAlpha}
        />
      </PgFacetPopover>

      <PgFacetPopover
        attribute={attr.remote}
        label="Remote"
        order={{ base: 4, lg: 6 }}
        icon={<LuMapPin />}
        testId={ids.facet.popover.remote}
      >
        <PgFacetAttribute
          attribute={attr.remote}
          label="Remote"
          operator="or"
          isFreezeTotalFacetCount
        />
      </PgFacetPopover>

      <PgFacetPopover
        attribute={attr.country}
        label="Country"
        order={{ base: 5, lg: 7 }}
        icon={<LuMapPin />}
        testId={ids.facet.popover.country}
      >
        <PgFacetAttribute
          attribute={attr.country}
          label="Country"
          isSearchEnabled
          operator="or"
          isFreezeTotalFacetCount
        />
      </PgFacetPopover>

      <PgFacetPopover
        attribute={attr.city}
        label="City"
        order={{ base: 6, lg: 8 }}
        icon={<LuMapPin />}
        testId={ids.facet.popover.city}
      >
        <PgFacetAttribute
          attribute={attr.city}
          label="City"
          isSearchEnabled
          operator="or"
          isFreezeTotalFacetCount
        />
      </PgFacetPopover>

      <PgFacetPopover label="Education" attribute={attr.education} order={{ base: 8, lg: 9 }}>
        <PgFacetAttribute
          attribute={attr.education}
          label="Education"
          transformItems={items =>
            sortByCustomOrder(items, [
              "Undergraduate Degree or Less",
              "Master's Degree",
              "Doctoral Degree",
            ])
          }
        />
      </PgFacetPopover>

      <OtherFiltersFacet order={{ base: 10 }} />
    </Grid>
  );
}

function OtherFiltersFacet(props: { order: { base: number } }) {
  const highlighted = useToggleRefinement({ attribute: "org.is_highlighted", on: true });
  const snap = useSnapshot(otherFiltersState);
  return (
    <PgFacetPopover label="Other Filters" order={props.order}>
      <Stack gap="gap.sm">
        <BooleanSwitch
          label="Show only roles at highlighted orgs"
          checked={highlighted.value.isRefined}
          onToggle={() => highlighted.refine(highlighted.value)}
        />
        <BooleanSwitch
          label="Exclude career capital roles"
          checked={snap.excludeCareerCapital}
          onToggle={() => {
            otherFiltersState.excludeCareerCapital = !otherFiltersState.excludeCareerCapital;
          }}
        />
        <BooleanSwitch
          label="Exclude Profit-for-Good roles"
          checked={snap.excludeProfitForGood}
          onToggle={() => {
            otherFiltersState.excludeProfitForGood = !otherFiltersState.excludeProfitForGood;
          }}
        />
      </Stack>
    </PgFacetPopover>
  );
}

function BooleanSwitch(props: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Switch.Root checked={props.checked} onCheckedChange={props.onToggle}>
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
