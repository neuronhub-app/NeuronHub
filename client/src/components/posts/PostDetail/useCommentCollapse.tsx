import { useCallback, useTransition } from "react";
import { proxySet } from "valtio/utils";
import { useAuth } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { UserListName } from "~/graphql/enums";

const collapsedIds = proxySet();

export function useCommentCollapse(props: { postId: ID }) {
  const auth = useAuth();

  const [, startTransition] = useTransition();

  useInit({
    isReady: Boolean(auth.isLoggedIn && props.postId),
    onInit: async () => {
      const res = await client.query({
        query: UserCollapsedCommentsQuery,
        variables: { parent_root_id: props.postId },
      });
      if (res.error) {
        return toast.error(res.error);
      }
      startTransition(() => {
        collapsedIds.clear();
        for (const postCollapsed of res.data!.user_current!.posts_collapsed) {
          collapsedIds.add(postCollapsed.id);
        }
      });
    },
  });

  const toggleCollapse = useCallback(async (id: ID) => {
    startTransition(async () => {
      if (collapsedIds.has(id)) {
        collapsedIds.delete(id);
      } else {
        collapsedIds.add(id);
      }

      if (auth.isLoggedIn) {
        await client.mutate({
          mutation: UpdateCollapsedCommentsMutation,
          variables: {
            id,
            list_field_name: UserListName.PostsCollapsed,
            is_added: collapsedIds.has(id),
          },
        });
      }
    });
  }, []);

  // Note: this is not a Valtio Snap (!) - to avoid 1000+ comments Snap subscriptions.
  // Only <CommentThread/> children must re-render - useCallback() will do it.
  const isCollapsed = useCallback((id: ID) => collapsedIds.has(id), []);

  return {
    startTransition,
    toggle: toggleCollapse,
    isCollapsed,
  };
}

const UserCollapsedCommentsQuery = graphql.persisted(
  "UserCollapsedComments",
  graphql(`
    query UserCollapsedComments($parent_root_id: ID!) {
      user_current {
        id
        posts_collapsed(filters: { parent_root_id: { exact: $parent_root_id } }) {
          id
        }
      }
    }
  `),
);

const UpdateCollapsedCommentsMutation = graphql.persisted(
  "UpdateCollapsedComments",
  graphql(`
    mutation UpdateCollapsedComments($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
      update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
    }
  `),
);
