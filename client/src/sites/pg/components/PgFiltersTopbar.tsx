import { Flex, Grid, Switch } from "@chakra-ui/react";
import { useRange, useRefinementList, useToggleRefinement } from "react-instantsearch";
import { PgFacetSalary, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import { facetStyle } from "@/components/algolia/AlgoliaFacets";
import { PgFacetAttribute } from "@/sites/pg/components/PgFacetAttribute";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";

export function PgFiltersTopbar() {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
      columnGap="gap.md"
      rowGap={{ base: "3.5", md: "2" }}
    >
      <CauseAreaFacet />
      <RoleTypeFacet />
      <CountryFacet />
      <ExperienceFacet />
      <SalaryFacet />
      <SkillSetFacet />
      <RemoteFacet />
      <CityFacet />
      <EducationFacet />
      <OtherFiltersFacet />
    </Grid>
  );
}

function CauseAreaFacet() {
  const causeArea = useRefinementList({ attribute: "tags_area.name" });
  return (
    <PgFacetPopover label="Cause Area" disabled={!causeArea.canRefine}>
      <PgFacetAttribute attribute="tags_area.name" label="Cause Area" />
    </PgFacetPopover>
  );
}

function RoleTypeFacet() {
  const roleType = useRefinementList({ attribute: "tags_workload.name" });
  return (
    <PgFacetPopover label="Role Type" disabled={!roleType.canRefine}>
      <PgFacetAttribute attribute="tags_workload.name" label="Role Type" />
    </PgFacetPopover>
  );
}

function CountryFacet() {
  const country = useRefinementList({ attribute: "tags_country.name" });
  return (
    <PgFacetPopover label="Country" disabled={!country.canRefine}>
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

function ExperienceFacet() {
  const experience = useRefinementList({ attribute: "tags_experience.name" });
  return (
    <PgFacetPopover label="Experience" disabled={!experience.canRefine}>
      <PgFacetAttribute attribute="tags_experience.name" label="Experience" />
    </PgFacetPopover>
  );
}

function SalaryFacet() {
  const salary = useRange({ attribute: "salary_min" });
  return (
    <PgFacetPopover
      label="Salary"
      disabled={!salary.canRefine}
      onClose={() => {
        salaryFilterState.showInfo = false;
      }}
      contentMaxW="var(--reference-width)"
    >
      <PgFacetSalary />
    </PgFacetPopover>
  );
}

function SkillSetFacet() {
  const skillSet = useRefinementList({ attribute: "tags_skill.name" });
  return (
    <PgFacetPopover label="Skill Set" disabled={!skillSet.canRefine}>
      <PgFacetAttribute attribute="tags_skill.name" label="Skill Set" isSearchEnabled />
    </PgFacetPopover>
  );
}

function RemoteFacet() {
  const remote = useToggleRefinement({ attribute: "is_remote", on: true });
  return (
    <PgFacetPopover label="Remote Roles" disabled={!remote.canRefine}>
      <BooleanSwitch
        label="Remote Roles"
        checked={remote.value.isRefined}
        onToggle={() => remote.refine(remote.value)}
      />
    </PgFacetPopover>
  );
}

function CityFacet() {
  const city = useRefinementList({ attribute: "tags_city.name" });
  return (
    <PgFacetPopover label="City" disabled={!city.canRefine}>
      <PgFacetAttribute attribute="tags_city.name" label="City" isSearchEnabled />
    </PgFacetPopover>
  );
}

function EducationFacet() {
  const education = useRefinementList({ attribute: "tags_education.name" });
  return (
    <PgFacetPopover label="Education" disabled={!education.canRefine}>
      <PgFacetAttribute attribute="tags_education.name" label="Education" />
    </PgFacetPopover>
  );
}

function OtherFiltersFacet() {
  const highlighted = useToggleRefinement({ attribute: "org.is_highlighted", on: true });
  return (
    <PgFacetPopover label="Other Filters" disabled={!highlighted.canRefine}>
      <BooleanSwitch
        label="Show only roles at highlighted orgs"
        checked={highlighted.value.isRefined}
        onToggle={() => highlighted.refine(highlighted.value)}
      />
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
