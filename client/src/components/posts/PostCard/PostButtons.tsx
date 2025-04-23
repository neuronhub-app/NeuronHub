import type { Post } from "@/apps/posts/list/PostList";
import type { PostReview } from "@/apps/reviews/list/PostReviewList";

import { user } from "@/apps/users/useUserCurrent";
import { PostButtonShare } from "@/components/posts/PostCard/PostButtonShare";
import { Tooltip } from "@/components/ui/tooltip";
import { type ID, graphql } from "@/gql-tada";
import { isPostReviewType } from "@/graphql/fragments/reviews";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { For, IconButton, Stack } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { LuLibrary } from "react-icons/lu";
import { useSnapshot } from "valtio/react";
import { ListFieldName } from "~/graphql/graphql";

// todo ~ put into PostCard [[./index.tsx]]
export function PostButtons(props: { post: Post | PostReview }) {
  const isPostReview = isPostReviewType(props.post);

  const buttons: Array<ComponentProps<typeof ReviewButton>> = [
    {
      fieldName: isPostReview ? ListFieldName.ReadLaterReviews : ListFieldName.ReadLaterPosts,
      iconPresent: <FaBookmark />,
      iconNotPresent: <FaRegBookmark />,
      id: props.post.id,
      label: "Reading list",
    },
    {
      fieldName: isPostReview ? ListFieldName.LibraryReviews : ListFieldName.LibraryPosts,
      iconPresent: <LuLibrary />,
      iconNotPresent: <LuLibrary />,
      id: props.post.id,
      label: "Library",
    },
  ];

  return (
    <Stack gap="gap.sm">
      <For each={buttons}>
        {propsChild => (
          <ErrorBoundary key={propsChild.fieldName}>
            <ReviewButton {...propsChild} />
          </ErrorBoundary>
        )}
      </For>
      <PostButtonShare
        id={props.post.id}
        fieldName={isPostReview ? ListFieldName.LibraryReviews : ListFieldName.LibraryPosts}
      />
    </Stack>
  );
}

function ReviewButton(props: {
  fieldName: ListFieldName;
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
    const isInList = userSnap.current[props.fieldName].some(
      (review: { pk: ID }) => review.pk === props.id,
    );
    state.mutable.isAdded = isInList;
  }, [userSnap.current?.[props.fieldName]]);

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
                mutation mutate_user_list(
                  $id: ID!, $list_field_name: ListFieldName!, $is_added: Boolean!
                ) {
                  mutate_user_list(
                    id: $id, list_field_name: $list_field_name, is_added: $is_added
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
