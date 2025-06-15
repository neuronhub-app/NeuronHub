import { user } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostButtonShare } from "@/components/posts/PostCard/PostButtonShare";
import { Tooltip } from "@/components/ui/tooltip";
import { type ID, graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { For, IconButton, Stack } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { LuLibrary } from "react-icons/lu";
import { useSnapshot } from "valtio/react";
import { UserListName } from "~/graphql/graphql";

// todo ~ put into PostCard [[./index.tsx]], and leave only `export ReviewButton`
// this is overly complex & abstract for a child component
export function PostButtons(props: { post: PostListItemType }) {
  const buttons: Array<ComponentProps<typeof ReviewButton>> = [
    {
      fieldName: UserListName.ReadLater,
      iconPresent: <FaBookmark />,
      iconNotPresent: <FaRegBookmark />,
      id: props.post.id,
      label: "Reading list",
    },
    {
      fieldName: UserListName.Library,
      iconPresent: <LuLibrary />,
      iconNotPresent: <LuLibrary />,
      id: props.post.id,
      label: "Library",
    },
  ];

  return (
    <Stack gap="gap.sm">
      <For each={buttons}>
        {buttonProps => (
          <ErrorBoundary key={buttonProps.fieldName}>
            <ReviewButton {...buttonProps} />
          </ErrorBoundary>
        )}
      </For>
      <PostButtonShare id={props.post.id} fieldName={UserListName.Library} />
    </Stack>
  );
}

function ReviewButton(props: {
  fieldName: UserListName;
  iconNotPresent: ReactNode;
  iconPresent: ReactNode;
  id: ID;
  label: string;
}) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isAdded: false,
  });

  useEffect(() => {
    if (!userSnap.current) {
      return;
    }
    const isInList = userSnap.current[props.fieldName]?.some(
      (post: { pk: ID }) => post.pk === props.id,
    );
    state.mutable.isAdded = isInList;
  }, [userSnap.current, props.fieldName, props.id]);

  const label = `${state.snap.isAdded ? "Remove from" : "Add to"} ${props.label}`;

  return (
    <Tooltip content={label} positioning={{ placement: "left" }}>
      <IconButton
        loading={state.snap.isLoading}
        onClick={async () => {
          if (state.snap.isLoading || !user.state.current) {
            return;
          }
          state.mutable.isLoading = true;
          await mutateAndRefetch(
            graphql(
              `
                mutation update_user_list(
                  $id: ID!
                  $list_field_name: UserListName!
                  $is_added: Boolean!
                ) {
                  update_user_list(
                    id: $id
                    list_field_name: $list_field_name
                    is_added: $is_added
                  )
                }
              `,
            ),
            {
              id: props.id,
              list_field_name: props.fieldName,
              is_added: !state.snap.isAdded,
            },
          );
          state.mutable.isLoading = false;
        }}
        data-state={state.snap.isAdded ? "checked" : "unchecked"}
        variant="subtle-ghost"
        size="sm"
        aria-label={label}
      >
        {state.snap.isAdded ? props.iconPresent : props.iconNotPresent}
      </IconButton>
    </Tooltip>
  );
}
