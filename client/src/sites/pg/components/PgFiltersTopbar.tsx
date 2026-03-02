import { Stack, Wrap } from "@chakra-ui/react";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
import { AlgoliaFacetSalary } from "@/components/algolia/AlgoliaFacetSalary";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";

export function PgFiltersTopbar() {
  return (
    <Wrap gap="gap.sm">
      <PgFacetPopover label="Cause Area">
        <AlgoliaFacetAttribute attribute="tags_area.name" label="Cause Area" />
      </PgFacetPopover>

      <PgFacetPopover label="Country / Region">
        <AlgoliaFacetAttribute
          attribute="tags_country.name"
          label="Country / Region"
          isSearchEnabled
          showFirst={5}
        />
      </PgFacetPopover>

      <PgFacetPopover label="Experience">
        <AlgoliaFacetAttribute attribute="tags_experience.name" label="Experience" />
      </PgFacetPopover>

      <PgFacetPopover label="Role Type">
        <AlgoliaFacetAttribute attribute="tags_workload.name" label="Role Type" />
      </PgFacetPopover>

      <PgFacetPopover label="Salary">
        <AlgoliaFacetSalary attribute="salary_min" label="Salary" />
      </PgFacetPopover>

      <PgFacetPopover label="Skill Set">
        <AlgoliaFacetAttribute
          attribute="tags_skill.name"
          label="Skill Set"
          isSearchEnabled
          showFirst={7}
        />
      </PgFacetPopover>

      <PgFacetPopover label="City">
        <AlgoliaFacetAttribute
          attribute="tags_city.name"
          label="City"
          isSearchEnabled
          showFirst={5}
        />
      </PgFacetPopover>

      <PgFacetPopover label="Education">
        <AlgoliaFacetAttribute attribute="tags_education.name" label="Education" />
      </PgFacetPopover>

      <PgFacetPopover label="Organization">
        <AlgoliaFacetAttribute attribute="org.name" label="Organization" isSearchEnabled />
      </PgFacetPopover>

      <PgFacetPopover label="Other Filters">
        <Stack gap="gap.md">
          <Stack gap="1">
            <AlgoliaFacetBoolean attribute="is_remote" label="Remote" />
            <AlgoliaFacetBoolean
              attribute="org.is_highlighted"
              label="Highlighted Organizations"
            />
          </Stack>
          <AlgoliaFacetDate attribute="posted_at_unix" label="Posted" />
        </Stack>
      </PgFacetPopover>
    </Wrap>
  );
}
