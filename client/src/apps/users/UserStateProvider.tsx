import { captureException } from "@sentry/react";
import { ResultOf } from "gql.tada";
import { type ReactNode, useEffect } from "react";

import { user } from "@/apps/users/useUserCurrent";
import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { track } from "@/utils/track/track";

/**
 * The source of truth for User - mounted in `root.tsx`.
 */
export function UserStateProvider(props: { children: ReactNode }) {
  const { data, error } = useApolloQuery(UserQueryDoc);

  useEffect(() => {
    if (data?.user_current) {
      track.users.setUser({ user: data.user_current });

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

      user.state.followedImporterUserSourceIds.clear();
      for (const item of data.user_current.users_followed_sources) {
        user.state.followedImporterUserSourceIds.add(item.id);
      }
    } else if (data?.user_current === null) {
      track.users.setUser({ idRandom: true });
    }

    if (error) {
      captureException(error);
    }
  }, [data, error]);

  return <>{props.children}</>;
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
        is_staff
        has_profile_groups

        library {
          pk
        }

        read_later {
          pk
        }

        users_followed_sources {
          id
        }

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
