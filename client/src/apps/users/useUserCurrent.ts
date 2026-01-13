import { captureException } from "@sentry/react";
import * as Sentry from "@sentry/react-router";
import type { ResultOf } from "gql.tada";
import { useEffect } from "react";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";
import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export namespace user {
  export const state = proxy({
    current: null as User | null,
    connections: [] as UserConnection[],
    postsCollapsed: [],
  });
}

export function useUser() {
  const { data, error } = useApolloQuery(UserQueryDoc);

  const snap = useSnapshot(user.state);

  useEffect(() => {
    if (data?.user_current) {
      user.state.current = data.user_current;

      if (data.user_current.connection_groups) {
        const connections = data.user_current.connection_groups
          .flatMap(group => group?.connections)
          .filter(Boolean);
        const connectionsUniqueMap = new Map(
          connections.map(conn => [`${conn.id}-${conn.username}`, conn]),
        );
        user.state.connections = Array.from(connectionsUniqueMap.values());
      }
    }

    Sentry.setUser(user.state.current);

    if (error) {
      captureException(error);
    }
  }, [data]);

  return snap.current;
}

export const UserQueryDoc = graphql.persisted(
  "UserCurrent",
  graphql(`
  query UserCurrent {
    user_current {
      id
      username
      name: username
      email
      is_superuser

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
        post {
          id
        }
        tag {
          id
        }
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
`),
);

type UserQuery = ResultOf<typeof UserQueryDoc>;
export type User = NonNullable<UserQuery["user_current"]>;
export type UserConnectionGroup = User["connection_groups"][number];
export type UserConnection = UserConnectionGroup["connections"][number];
