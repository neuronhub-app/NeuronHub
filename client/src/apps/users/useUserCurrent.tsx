import type { ResultOf } from "@graphql-typed-document-node/core";
import { graphql } from "gql.tada";
import { useEffect } from "react";
import { useQuery } from "urql";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";

export namespace user {
  export const state = proxy({ current: null, connections: [] } as {
    current: User | null;
    connections: UserConnection[];
  });
}

export function useUserCurrent() {
  const [{ data, error, fetching }] = useQuery<UserQuery>({
    query: UserQueryDoc,
  });

  const snap = useSnapshot(user.state);

  useEffect(() => {
    if (data?.user_current) {
      const connectionsRaw = data.user_current.connection_groups.flatMap(
        group => group.connections,
      ) as UserConnection[]; // @bad-inference
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
