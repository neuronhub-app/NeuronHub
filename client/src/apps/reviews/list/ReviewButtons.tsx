import type { ReviewType } from "@/apps/reviews/list/index";
import { user } from "@/apps/users/useUserCurrent";
import { Tooltip } from "@/components/ui/tooltip";
import { graphql } from "@/gql-tada";
import { UserReviewListName, type UserType } from "@/graphql/graphql";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { For, IconButton, Stack } from "@chakra-ui/react";
import { ErrorBoundary } from "@sentry/react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { LuLibrary } from "react-icons/lu";
import { useSnapshot } from "valtio/react";

export function ReviewButtons(props: { review: ReviewType }) {
  const buttons: Array<ComponentProps<typeof ReviewButton>> = [
    {
      field: UserReviewListName.ReviewsReadLater,
      iconPresent: <FaBookmark />,
      iconNotPresent: <FaRegBookmark />,
      reviewId: props.review.id,
      label: "Reading list",
    },
    {
      field: UserReviewListName.ReviewsLibrary,
      iconPresent: <LuLibrary />,
      iconNotPresent: <LuLibrary />,
      reviewId: props.review.id,
      label: "Library",
    },
  ];

  return (
    <Stack gap="gap.sm">
      <For each={buttons}>
        {propsChild => (
          <ErrorBoundary key={propsChild.field}>
            <ReviewButton {...propsChild} />
          </ErrorBoundary>
        )}
      </For>
    </Stack>
  );
}

function ReviewButton(props: {
  field: UserReviewListName;
  iconNotPresent: ReactNode;
  iconPresent: ReactNode;
  reviewId: string;
  label: string;
}) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isAdded: false,
  });

  let userField: keyof UserType;
  switch (props.field) {
    case UserReviewListName.ReviewsReadLater:
      userField = "reviews_read_later";
      break;
    case UserReviewListName.ReviewsLibrary:
      userField = "reviews_library";
      break;
    default:
      throw new Error();
  }

  useEffect(() => {
    if (!userSnap.current) {
      return;
    }
    const isInList = userSnap.current[userField].some(
      (review: { pk: string }) => review.pk === props.reviewId,
    );
    state.mutable.isAdded = isInList;
  }, [userSnap.current?.[userField]]);

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
                mutation toggle_user_review_list(
                  $reviewId: ID!, $reviewListName: UserReviewListName!, $isAdded: Boolean!
                ) {
                  toggle_user_review_list(
                    review_pk: $reviewId, review_list_name: $reviewListName, is_added: $isAdded
                  )
                }
              `,
            ),
            {
              reviewId: props.reviewId,
              reviewListName: props.field,
              isAdded: !state.snap.isAdded,
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
