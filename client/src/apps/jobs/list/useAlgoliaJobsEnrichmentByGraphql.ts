import { graphql } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export function useAlgoliaJobsEnrichmentByGraphql(jobsAlgolia: JobFragmentType[]) {
  return useAlgoliaEnrichmentByGraphql(jobsAlgolia, JobsByIdsQuery, data => data.jobs);
}

const JobsByIdsQuery = graphql.persisted(
  "JobsByIds",
  graphql(
    `
    query JobsByIds($ids: [ID!]!) {
      jobs(filters: { id: { in_list: $ids } }) {
        ...JobFragment
      }
    }
  `,
    [JobFragment],
  ),
);
