import { graphql, type ResultOf } from "gql.tada";
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
        connectionsRaw.map(conn => [`${conn.id}-${conn.username}`, conn]),
      );
      user.state.connections = Array.from(connectionsUniqueMap.values());
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
      username
      name: username
      email
      
      library { pk }
      
      read_later { pk }

      post_votes {
        id
        is_vote_positive
        post {
          id
          type
        }
      }
      post_tag_votes {
        id
        is_vote_positive
        is_changed_my_mind
      }

      connection_groups {
        id
        name

        connections {
          id
          username
          name: username
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
  username: string;
};
