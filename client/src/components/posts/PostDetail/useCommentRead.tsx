import { useCallback, useTransition } from "react";
import { proxySet } from "valtio/utils";

import { UserListName } from "~/graphql/enums";

import { useAuth } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";

const readIds = proxySet<ID>();

export function useCommentRead(props: { postId?: ID }) {
  const auth = useAuth();

  const [, startTransition] = useTransition();

  useInit({
    isReady: Boolean(auth.isLoggedIn && props.postId),
    onInit: async () => {
      const res = await client.query({
        query: UserReadCommentsQuery,
        variables: { parent_root_id: props.postId! },
      });
      if (res.error) {
        return toast.error(res.error);
      }
      startTransition(() => {
        readIds.clear();
        for (const postRead of res.data!.user_current!.posts_read) {
          readIds.add(postRead.id);
        }
      });
    },
  });

  const toggleRead = useCallback(
    async (id: ID) => {
      startTransition(async () => {
        if (readIds.has(id)) {
          readIds.delete(id);
        } else {
          readIds.add(id);
        }

        if (auth.isLoggedIn) {
          const res = await client.mutate({
            mutation: UpdateReadCommentsMutation,
            variables: {
              id,
              list_field_name: UserListName.PostsRead,
              is_added: readIds.has(id),
            },
          });

          if (res.error) {
            if (readIds.has(id)) {
              readIds.delete(id);
            } else {
              readIds.add(id);
            }
            toast.error("Failed to update read status");
          }
        }
      });
    },
    [auth.isLoggedIn],
  );

  // Note: this is not a Valtio Snap (!) - to avoid 1000+ comments Snap subscriptions.
  // Only <CommentThread/> children must re-render - useCallback() will do it.
  const isRead = useCallback((id: ID) => readIds.has(id), []);

  return {
    toggle: toggleRead,
    isRead,
  };
}

const UserReadCommentsQuery = graphql.persisted(
  "UserReadComments",
  graphql(`
    query UserReadComments($parent_root_id: ID!) {
      user_current {
        id
        posts_read(filters: { parent_root_id: { exact: $parent_root_id } }) {
          id
        }
      }
    }
  `),
);

export const UpdateReadCommentsMutation = graphql.persisted(
  "UpdateReadComments",
  graphql(`
    mutation UpdateReadComments($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
      update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
    }
  `),
);
