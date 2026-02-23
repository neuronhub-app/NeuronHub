import { Configure } from "react-instantsearch";

import { JobCard } from "@/apps/jobs/list/JobCard/JobCard";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
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
      searchInputTestId={ids.job.searchInput}
      hits={{
        enrichment: { query: JobsByIdsQuery, extractItems: data => data.jobs },
        renderHit: (job, ctx) => (
          <JobCard key={job.id} job={job} isSearchActive={ctx.isSearchActive} />
        ),
        listTestId: ids.job.list,
      }}
    >
      <Configure
        hitsPerPage={20}
        attributesToHighlight={[
          "title",
          "org",
          "country",
          "city",
          "tags_skill.name",
          "tags_area.name",
        ]}
      />

      <AlgoliaFacetsActive
        labelsOverride={{ is_remote: "Remote", posted_at: "Posted" }}
        dateAttributes={["posted_at"]}
      />

      <AlgoliaFacetBoolean attribute="is_remote" label="Remote" />

      <AlgoliaFacetAttribute attribute="tags_experience.name" label="Experience" />
      <AlgoliaFacetAttribute attribute="country" label="Country" isSearchEnabled showFirst={4} />
      <AlgoliaFacetAttribute attribute="city" label="City" isSearchEnabled showFirst={3} />
      <AlgoliaFacetAttribute
        attribute="tags_skill.name"
        label="Skills"
        isSearchEnabled
        showFirst={7}
      />
      <AlgoliaFacetAttribute attribute="tags_area.name" label="Area" />
      <AlgoliaFacetAttribute attribute="tags_workload.name" label="Workload" />
      <AlgoliaFacetDate attribute="posted_at" label="Posted" />
      <AlgoliaFacetAttribute attribute="tags_education.name" label="Education" />
      <AlgoliaFacetAttribute attribute="org" label="Organization" isSearchEnabled />
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
