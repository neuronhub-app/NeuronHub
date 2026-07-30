/**
 * Rendered INSIDE <InstantSearch> (by [[PgAlgoliaList.tsx]]) so the Algolia hooks resolve.
 */
import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { useCurrentRefinements, useInstantSearch } from "react-instantsearch";
import { useNavigate } from "react-router";

import { buildJobAlertVars, JobAlertUpdateMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import {
  JobAlertAccessSessionByIdMutation,
  JobAlertListQuery,
} from "@/apps/jobs/subscriptions/JobAlertList";
import { ids } from "@/e2e/ids";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useSeedPgFacetsForEdit } from "@/sites/pg/components/pgFacetEditMode";
import { JobLocationsQuery } from "@/sites/pg/components/PgFacetLocation";
import { alertToAlgoliaState } from "@/sites/pg/pages/jobs/list/alertToAlgoliaState";
import { seedJobAlertEdit } from "@/sites/pg/pages/jobs/list/jobAlertEditState";
import {
  resetJobListFilters,
  setJobListSalary,
  useJobListFilters,
} from "@/sites/pg/pages/jobs/list/jobListFilters";
import { layout } from "@/sites/pg/PgLayoutConfig";
import { urls } from "@/urls";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { useIsLoading } from "@/utils/useIsLoading";

export function JobAlertEditController(props: { idExt: string }) {
  useSeedPgFacetsForEdit();

  const search = useInstantSearch();
  const navigate = useNavigate();
  const loading = useIsLoading();

  const refinesCurrent = useCurrentRefinements();
  const jobFilters = useJobListFilters();
  const { data: locationsData } = useApolloQuery(JobLocationsQuery);
  const alertsQuery = useApolloQuery(JobAlertListQuery);

  useInit({
    isReady: props.idExt,
    onInit: async () => {
      await mutateAndRefetchMountedQueries(JobAlertAccessSessionByIdMutation, {
        id_ext: props.idExt,
      });
    },
    dependencies: [props.idExt],
  });

  const alert = alertsQuery.data?.job_alerts?.find(item => item.id_ext === props.idExt);

  const isApplied = useRef(false);
  useInit({
    isReady: Boolean(alert) && !isApplied.current,
    onInit: () => {
      isApplied.current = true;
      const state = alertToAlgoliaState(alert!);
      search.setIndexUiState(state.uiState);
      setJobListSalary(state.salary);
    },
    dependencies: [alert?.id_ext],
  });

  async function handleSave() {
    const result = await mutateAndRefetchMountedQueries(JobAlertUpdateMutation, {
      id_ext: props.idExt,
      ...buildJobAlertVars(refinesCurrent.items, locationsData?.job_locations, jobFilters.snap),
    });
    if (result.success && result.data.job_alert_update) {
      toast.success("Alert updated");
      navigate(urls.jobs.subscriptions);
    } else if (!result.success) {
      toast.error(result.error);
    } else {
      toast.error("Could not update this alert");
    }
  }

  function handleCancel() {
    seedJobAlertEdit(undefined);
    resetJobListFilters();
    search.setIndexUiState({});
  }

  return (
    <Box bg="brand.green" pos="relative" left="50%" ml="-50vw" w="100vw" py="gap.md">
      <Container px={layout.style.container.paddingX}>
        <Box
          colorPalette="orange"
          w="full"
          p="gap.md"
          bg="colorPalette.solid"
          color="colorPalette.contrast"
          rounded="lg"
        >
          <Flex justify="space-between" align="center" gap="gap.md" flexWrap="wrap">
            <Text fontWeight="medium" {...ids.set(ids.job.alert.edit.banner)}>
              Editing alert for {alert?.email}
            </Text>

            <Flex gap="gap.sm">
              <Button
                onClick={() => loading.track(handleSave)}
                loading={loading.isActive}
                size="sm"
                bg="colorPalette.contrast"
                color="colorPalette.solid"
                _hover={{ bg: "colorPalette.subtle" }}
                {...ids.set(ids.job.alert.edit.save)}
              >
                Save changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                borderColor="colorPalette.contrast"
                color="colorPalette.contrast"
                _hover={{ bg: "colorPalette.emphasized" }}
                {...ids.set(ids.job.alert.edit.cancel)}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
