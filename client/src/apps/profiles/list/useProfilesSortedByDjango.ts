import { graphql } from "@/gql-tada";
import { ProfileFragment, type ProfileFragmentType } from "@/graphql/fragments/profiles";
import { useApolloQuery } from "@/graphql/useApolloQuery";

const ProfilesSortedByMatchQuery = graphql.persisted(
  "ProfilesSortedByMatch",
  graphql(
    `
    query ProfilesSortedByMatch($sort: String!, $offset: Int!, $limit: Int!) {
      profiles_sorted_by_match(sort: $sort, pagination: { offset: $offset, limit: $limit }) {
        total_count
        results {
          ...ProfileFragment
        }
      }
    }
  `,
    [ProfileFragment],
  ),
);

export function useProfilesSortedByDjango(props: {
  sort: string;
  offset: number;
  limit: number;
  skip: boolean;
}) {
  const { data, isLoadingFirstTime } = useApolloQuery(
    ProfilesSortedByMatchQuery,
    { sort: props.sort, offset: props.offset, limit: props.limit },
    { skip: props.skip },
  );

  const result = data?.profiles_sorted_by_match;

  return {
    items: (result?.results ?? []) as ProfileFragmentType[],
    totalCount: result?.total_count ?? 0,
    isLoadingFirstTime,
  };
}
