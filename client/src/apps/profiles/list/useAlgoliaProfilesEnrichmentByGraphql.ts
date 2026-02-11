import { graphql } from "@/gql-tada";
import { ProfileFragment, type ProfileFragmentType } from "@/graphql/fragments/profiles";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export function useAlgoliaProfilesEnrichmentByGraphql(profilesAlgolia: ProfileFragmentType[]) {
  return useAlgoliaEnrichmentByGraphql(
    profilesAlgolia,
    ProfilesByIdsQuery,
    data => data.profiles,
  );
}

const ProfilesByIdsQuery = graphql.persisted(
  "ProfilesByIds",
  graphql(
    `
    query ProfilesByIds($ids: [ID!]!) {
      profiles(filters: { id: { in_list: $ids } }) {
        ...ProfileFragment
      }
    }
  `,
    [ProfileFragment],
  ),
);
