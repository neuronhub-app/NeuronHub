import { gql } from "@/graphql/gql";
import { useQuery } from "urql";

export function useUserCurrent() {
  const [{ data, error, fetching }] = useQuery({
    query: USER_CURRENT_QUERY,
  });

  return {
    user: data?.user_current,
    error: error,
    fetching,
  };
}

export const USER_CURRENT_QUERY = gql(`
	query UserCurrent {
		user_current {
			id
			first_name
		}
	}
`);
