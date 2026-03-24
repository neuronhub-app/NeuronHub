import { Flex, Grid, Stack, Switch } from "@chakra-ui/react";
import { useRange, useRefinementList, useToggleRefinement } from "react-instantsearch";
import { proxy, useSnapshot } from "valtio";
import { PgFacetSalary, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import type { UseRefinementListProps } from "react-instantsearch";
import { PgFacetAttribute } from "@/sites/pg/components/PgFacetAttribute";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";

const sortAlpha = ["name:asc", "count:desc"] satisfies UseRefinementListProps["sortBy"];

const roleTypeOrder = [
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
];

const educationOrder = ["Undergraduate Degree or Less", "Master's Degree", "Doctoral Degree"];

function sortByCustomOrder<T extends { label: string }>(items: T[], order: string[]): T[] {
  return items.toSorted((a, b) => {
    const indexA = order.indexOf(a.label);
    const indexB = order.indexOf(b.label);
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

const transformRoleType: UseRefinementListProps["transformItems"] = items =>
  sortByCustomOrder(items, roleTypeOrder);

const transformEducation: UseRefinementListProps["transformItems"] = items =>
  sortByCustomOrder(items, educationOrder);

export const otherFiltersState = proxy({
  excludeCareerCapital: false,
  excludeProfitForGood: false,
});

export function resetOtherFilters() {
  otherFiltersState.excludeCareerCapital = false;
  otherFiltersState.excludeProfitForGood = false;
}

type FacetOrder = { base?: number; lg?: number };

export function PgFiltersTopbar() {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
      columnGap="gap.md"
      rowGap={{ base: "3.5", md: "2" }}
    >
      <CauseAreaFacet order={{ base: 1, lg: 1 }} />
      <RoleTypeFacet order={{ base: 3, lg: 2 }} />
      <CountryFacet order={{ base: 5, lg: 3 }} />
      <ExperienceFacet order={{ base: 7, lg: 4 }} />
      <SalaryFacet order={{ base: 9, lg: 5 }} />
      <SkillSetFacet order={{ base: 2, lg: 6 }} />
      <RemoteFacet order={{ base: 4, lg: 7 }} />
      <CityFacet order={{ base: 6, lg: 8 }} />
      <EducationFacet order={{ base: 8, lg: 9 }} />
      <OtherFiltersFacet order={{ base: 10 }} />
    </Grid>
  );
}

function CauseAreaFacet(props: { order: FacetOrder }) {
  const causeArea = useRefinementList({ attribute: "tags_area.name" });
  return (
    <PgFacetPopover label="Cause Area" disabled={!causeArea.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_area.name" label="Cause Area" sortBy={sortAlpha} />
    </PgFacetPopover>
  );
}

function RoleTypeFacet(props: { order: FacetOrder }) {
  const roleType = useRefinementList({ attribute: "tags_workload.name" });
  return (
    <PgFacetPopover label="Role Type" disabled={!roleType.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_workload.name"
        label="Role Type"
        transformItems={transformRoleType}
      />
    </PgFacetPopover>
  );
}

function CountryFacet(props: { order: FacetOrder }) {
  const country = useRefinementList({ attribute: "tags_country.name" });
  return (
    <PgFacetPopover label="Country" disabled={!country.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_country.name"
        label="Country"
        isSearchEnabled
        subFacet={{
          attribute: "tags_country_visa_sponsor.name",
          label: "Confirmed can sponsor visas",
        }}
      />
    </PgFacetPopover>
  );
}

function ExperienceFacet(props: { order: FacetOrder }) {
  const experience = useRefinementList({ attribute: "tags_experience.name" });
  return (
    <PgFacetPopover label="Experience" disabled={!experience.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_experience.name" label="Experience" />
    </PgFacetPopover>
  );
}

function SalaryFacet(props: { order: FacetOrder }) {
  const salary = useRange({ attribute: "salary_min" });
  return (
    <PgFacetPopover
      label="Minimum Salary"
      disabled={!salary.canRefine}
      onClose={() => {
        salaryFilterState.showInfo = false;
      }}
      contentMaxW="var(--reference-width)"
      order={props.order}
    >
      <PgFacetSalary />
    </PgFacetPopover>
  );
}

function SkillSetFacet(props: { order: FacetOrder }) {
  const skillSet = useRefinementList({ attribute: "tags_skill.name" });
  return (
    <PgFacetPopover label="Skill Set" disabled={!skillSet.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_skill.name"
        label="Skill Set"
        isSearchEnabled
        sortBy={sortAlpha}
      />
    </PgFacetPopover>
  );
}

const remoteLocationNames = ["Remote, Global", "Remote, USA", "Remote, UK", "Remote, Europe"];

function RemoteFacet(props: { order: FacetOrder }) {
  return (
    <PgFacetPopover label="Remote Roles" order={props.order}>
      <PgFacetAttribute
        attribute="locations.name"
        label="Remote Roles"
        allowedValues={remoteLocationNames}
      />
    </PgFacetPopover>
  );
}

function CityFacet(props: { order: FacetOrder }) {
  const city = useRefinementList({ attribute: "tags_city.name" });
  return (
    <PgFacetPopover label="City" disabled={!city.canRefine} order={props.order}>
      <PgFacetAttribute attribute="tags_city.name" label="City" isSearchEnabled />
    </PgFacetPopover>
  );
}

function EducationFacet(props: { order: FacetOrder }) {
  const education = useRefinementList({ attribute: "tags_education.name" });
  return (
    <PgFacetPopover label="Education" disabled={!education.canRefine} order={props.order}>
      <PgFacetAttribute
        attribute="tags_education.name"
        label="Education"
        transformItems={transformEducation}
      />
    </PgFacetPopover>
  );
}

function OtherFiltersFacet(props: { order: FacetOrder }) {
  const highlighted = useToggleRefinement({ attribute: "org.is_highlighted", on: true });
  const snap = useSnapshot(otherFiltersState);
  return (
    <PgFacetPopover label="Other Filters" disabled={!highlighted.canRefine} order={props.order}>
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
