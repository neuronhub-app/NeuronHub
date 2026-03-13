import { Stack } from "@chakra-ui/react";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
import { AlgoliaFacetSalary } from "@/components/algolia/AlgoliaFacetSalary";

export function PgFacetsSidebar() {
  return (
    <Stack gap="gap.md2">
      <AlgoliaFacetAttribute attribute="tags_area.name" label="Cause Area" />
      <AlgoliaFacetAttribute
        attribute="tags_country.name"
        label="Country / Region"
        isSearchEnabled
        showFirst={5}
      />
      <AlgoliaFacetAttribute attribute="tags_experience.name" label="Experience" />
      <AlgoliaFacetAttribute attribute="tags_workload.name" label="Role Type" />
      <AlgoliaFacetSalary attribute="salary_min" label="Salary" />
      <AlgoliaFacetAttribute
        attribute="tags_skill.name"
        label="Skill Set"
        isSearchEnabled
        showFirst={7}
      />
      <AlgoliaFacetAttribute
        attribute="tags_city.name"
        label="City"
        isSearchEnabled
        showFirst={5}
      />
      <AlgoliaFacetAttribute attribute="tags_education.name" label="Education" />
      <AlgoliaFacetAttribute attribute="org.name" label="Organization" isSearchEnabled />
      <Stack gap="1">
        <AlgoliaFacetBoolean attribute="is_remote" label="Remote" />
        <AlgoliaFacetBoolean attribute="org.is_highlighted" label="Highlighted Organizations" />
      </Stack>
      <AlgoliaFacetDate attribute="posted_at_unix" label="Posted" />
    </Stack>
  );
}
