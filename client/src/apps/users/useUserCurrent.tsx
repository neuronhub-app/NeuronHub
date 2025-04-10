import type { ResultOf } from "@graphql-typed-document-node/core";
import { graphql } from "gql.tada";
import { useEffect } from "react";
import { useQuery } from "urql";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";

export namespace user {
  export const state = proxy({
    current: null as User | null,
    connections: [] as UserConnection[],
  });
}

export function useUserCurrent() {
  const [{ data, error, fetching }] = useQuery({ query: UserQueryDoc });

  const snap = useSnapshot(user.state);

  useEffect(() => {
    if (data?.user_current) {
      const connectionsRaw = data.user_current.connection_groups.flatMap(
        group => group.connections,
      );
      const connectionsUniqueMap = new Map(
        connectionsRaw.map(conn => [`${conn.id}-${conn.name}`, conn]),
      );
      const connectionsUnique = Array.from(connectionsUniqueMap.values());

      user.state.connections = connectionsUnique;
      user.state.current = data.user_current;
    }
  }, [data]);

  return {
    user: snap.current,
    connections: snap.connections,
    error: error,
    fetching,
  };
}

export const UserQueryDoc = graphql(`
  query UserCurrent {
    user_current {
      id
      name
      email
      
      reviews_library { pk }
      reviews_read_later { pk }

      tool_review_votes {
        id
        is_vote_positive
        review {
          pk
        }
      }

      connection_groups {
        id
        name

        connections {
          id
          name
        }
      }
    }
  }
`);

type UserQuery = ResultOf<typeof UserQueryDoc>;
export type User = NonNullable<UserQuery["user_current"]>;
export type UserConnectionGroup = User["connection_groups"][number];
// @bad-inference otherwise `name: unknown`
export type UserConnection = UserConnectionGroup["connections"][number] & {
  name: string;
};
