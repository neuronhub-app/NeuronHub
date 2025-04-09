import type { ReviewType } from "@/apps/reviews/list/index";
import { user } from "@/apps/users/useUserCurrent";
import { Tooltip } from "@/components/ui/tooltip";
import { graphql } from "@/gql-tada";
import { UserReviewListName, type UserType } from "@/graphql/graphql";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { For, IconButton, Stack } from "@chakra-ui/react";
import { ErrorBoundary, captureException } from "@sentry/react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import toast from "react-hot-toast";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { LuLibrary } from "react-icons/lu";
import { useClient } from "urql";
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
  const client = useClient();
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isAdded: false,
  });

  let userField: keyof UserType = "reviews_library";
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
          const isAdded = !state.snap.isAdded;
          const res = await toggleUserReviewList({
            client: client,
            reviewId: props.reviewId,
            reviewListName: props.field,
            isAdded,
          });
          if (res.success) {
            // todo ~ replace with urql network/cache, this shit will bite back
            if (isAdded) {
              user.state.current![userField].push({ pk: props.reviewId });
            } else {
              user.state.current![userField] = user.state.current![userField].filter(
                (review: { pk: string }) => review.pk !== props.reviewId,
              );
            }
          } else {
            toast.error(res.error);
          }
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

async function toggleUserReviewList(args: {
  client: ReturnType<typeof useClient>;
  reviewId: string;
  reviewListName: UserReviewListName;
  isAdded: boolean;
}) {
  const res = await args.client
    .mutation(
      graphql(
        `
          mutation toggle_user_review_list(
            $reviewId: ID!,
            $reviewListName: UserReviewListName!,
            $isAdded: Boolean!
          ) {
            toggle_user_review_list(
              review_pk: $reviewId,
              review_list_name: $reviewListName
              is_added: $isAdded
            )
          }
        `,
      ),
      args,
    )
    .toPromise();

  if (res.error) {
    captureException(res.error);
    return { success: false, error: res.error.message } as const;
  }
  return { success: true } as const;
}
