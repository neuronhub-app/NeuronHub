import { Stack } from "@chakra-ui/react";
import { Configure } from "react-instantsearch";
import { JobCard } from "@/apps/jobs/list/JobCard/JobCard";
import { JobsSubscribeModal } from "@/apps/jobs/list/JobsSubscribeModal";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
import { AlgoliaFacetSalary } from "@/components/algolia/AlgoliaFacetSalary";
import { AlgoliaFacetsActive } from "@/components/algolia/AlgoliaFacetsActive";
import { AlgoliaList } from "@/components/algolia/AlgoliaList";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";

export function JobList() {
  return (
    <AlgoliaList<JobFragmentType>
      index="indexNameJobs"
      label="job"
      cta={<JobsSubscribeModal />}
      hits={{
        enrichment: { query: JobsByIdsQuery, extractItems: data => data.jobs },
        renderHit: (job, ctx) => (
          <JobCard key={job.id} job={job} isSearchActive={ctx.isSearchActive} />
        ),
        listTestId: ids.job.list,
      }}
      searchInputTestId={ids.job.searchInput}
    >
      <Configure
        hitsPerPage={20}
        attributesToHighlight={[
          "title",
          "org.name",
          "country",
          "city",
          "tags_skill.name",
          "tags_area.name",
        ]}
      />

      <AlgoliaFacetsActive
        labelsOverride={{
          is_remote: "Remote",
          "org.is_highlighted": "Highlighted",
          posted_at_unix: "Posted",
          salary_min: "Salary",
        }}
        dateAttributes={["posted_at_unix"]}
      />

      <Stack gap="1">
        <AlgoliaFacetBoolean attribute="is_remote" label="Remote" />
        <AlgoliaFacetBoolean attribute="org.is_highlighted" label="Highlighted Organizations" />
      </Stack>

      <AlgoliaFacetAttribute attribute="tags_experience.name" label="Experience" />
      <AlgoliaFacetAttribute attribute="country" label="Country" isSearchEnabled showFirst={5} />
      <AlgoliaFacetAttribute attribute="city" label="City" isSearchEnabled showFirst={5} />
      <AlgoliaFacetSalary attribute="salary_min" label="Salary" />
      <AlgoliaFacetAttribute
        attribute="tags_skill.name"
        label="Skills"
        isSearchEnabled
        showFirst={7}
      />
      <AlgoliaFacetAttribute attribute="tags_area.name" label="Area" />
      <AlgoliaFacetAttribute attribute="tags_workload.name" label="Workload" />
      <AlgoliaFacetDate attribute="posted_at_unix" label="Posted" />
      <AlgoliaFacetAttribute attribute="tags_education.name" label="Education" />
      <AlgoliaFacetAttribute attribute="org.name" label="Organization" isSearchEnabled />
    </AlgoliaList>
  );
}

const JobsByIdsQuery = graphql.persisted(
  "JobsByIds",
  graphql(
    `query JobsByIds($ids: [ID!]!) {
      jobs(filters: { id: { in_list: $ids } }) {
        ...JobFragment
      }
    }`,
    [JobFragment],
  ),
);
