import { Alert, CloseButton, Spinner } from "@chakra-ui/react";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { useInit } from "@/utils/useInit";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export function useJobUnsubscribeHandler(alertIdExt?: string) {
  const state = useStateValtio({
    isUnsubscribeRequest: false,
    unsubscribeError: null as string | null,
  });

  const unsubscribeHook = useInit({
    isReady: Boolean(alertIdExt),
    onInit: async () => {
      state.mutable.isUnsubscribeRequest = true;

      const result = await mutateAndRefetchMountedQueries(JobAlertUnsubscribeMutation, {
        id_ext: alertIdExt!,
      });
      if (!result.success) {
        state.mutable.unsubscribeError =
          typeof result.errorMessage === "string"
            ? result.errorMessage
            : "Failed to unsubscribe, please try again.";
      }
    },
    dependencies: [alertIdExt],
  });

  let status: "info" | "error" | "success";
  if (unsubscribeHook.isLoading) {
    status = "info";
  } else if (state.snap.unsubscribeError) {
    status = "error";
  } else {
    status = "success";
  }

  return {
    isUnsubscribeRequest: state.snap.isUnsubscribeRequest,
    Alert: () => (
      <Alert.Root
        status={status}
        {...getOutlineBleedingProps("subtle")}
        {...ids.set(ids.job.subscriptions.unsubscribed.alert)}
      >
        {unsubscribeHook.isLoading ? (
          <Alert.Indicator>
            <Spinner size="sm" />
          </Alert.Indicator>
        ) : (
          <Alert.Indicator />
        )}
        <Alert.Content justifyItems="center">
          <Alert.Title>
            {unsubscribeHook.isLoading
              ? "Unsubscribing..."
              : (state.snap.unsubscribeError ?? "Unsubscribed.")}
          </Alert.Title>
        </Alert.Content>

        <CloseButton
          pos="relative"
          h="min-content"
          variant="subtle"
          onClick={() => {
            state.mutable.isUnsubscribeRequest = false;
          }}
        />
      </Alert.Root>
    ),
  };
}

const JobAlertUnsubscribeMutation = graphql.persisted(
  "JobAlertUnsubscribe",
  graphql(`
    mutation JobAlertUnsubscribe($id_ext: UUID!) {
      job_alert_unsubscribe(id_ext: $id_ext)
    }
  `),
);
