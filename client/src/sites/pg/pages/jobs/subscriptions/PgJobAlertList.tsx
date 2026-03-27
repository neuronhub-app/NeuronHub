import { Badge, Flex, HStack, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import { LuPause, LuPlay, LuTrash2 } from "react-icons/lu";
import { NavLink } from "react-router";
import {
  JobAlertListQuery,
  JobAlertAccessSessionByIdMutation,
  JobAlertToggleActiveMutation,
  JobAlertRemoveMutation,
} from "@/apps/jobs/subscriptions/JobAlertList";
import { useJobUnsubscribeHandler } from "@/apps/jobs/subscriptions/useJobUnsubscribeHandler";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { type ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { format } from "@neuronhub/shared/utils/format";
import { pgTagStyle } from "@/sites/pg/pgTagStyle";
import { useInit } from "@/utils/useInit";
import { useIsLoading } from "@/utils/useIsLoading";

export function PgJobAlertList(props: {
  unsubscribeByIdExt?: string;
  accessSessionByIdExt?: string;
}) {
  useInit({
    isReady: props.accessSessionByIdExt,
    onInit: async () => {
      await mutateAndRefetchMountedQueries(JobAlertAccessSessionByIdMutation, {
        id_ext: props.accessSessionByIdExt!,
      });
    },
    dependencies: [props.accessSessionByIdExt],
  });

  const { data, isLoadingFirstTime } = useApolloQuery(JobAlertListQuery);

  const unsubscribe = useJobUnsubscribeHandler(props.unsubscribeByIdExt);

  if (isLoadingFirstTime) {
    return <Text color="fg.muted">Loading subscriptions...</Text>;
  }

  const alerts = data?.job_alerts ?? [];

  return (
    <Stack gap="gap.lg" w="100%" py={{ base: "gap.lg", md: "gap.xl" }}>
      {unsubscribe.isUnsubscribeRequest && <unsubscribe.Alert />}

      {alerts.length === 0 && (
        <Stack
          p={{ base: "gap.md", md: "gap.xl" }}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="subtle"
          bg="bg.card"
          gap="gap.sm"
          align="center"
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold" fontFamily="heading">
            Job Subscriptions
          </Text>
          <Text color="fg.muted">
            No active subscriptions - subscribe on{" "}
            <Link asChild>
              <NavLink to={urls.jobs.list}>the Jobs page</NavLink>
            </Link>
            .
          </Text>
        </Stack>
      )}

      <Stack gap="gap.md" {...ids.set(ids.job.subscriptions.list)}>
        {alerts.map(alert => (
          <PgAlertCard key={alert.id} alert={alert} />
        ))}
      </Stack>
    </Stack>
  );
}

type AlertType = NonNullable<ResultOf<typeof JobAlertListQuery>["job_alerts"]>[number];

function PgAlertCard(props: { alert: AlertType }) {
  const loading = useIsLoading();

  const isHasFilters =
    props.alert.tags.length > 0 ||
    props.alert.is_orgs_highlighted ||
    props.alert.is_remote ||
    props.alert.salary_min != null;

  return (
    <Stack
      {...ids.set(ids.job.subscriptions.card)}
      pos="relative"
      gap="0"
      p={{ base: "gap.md", md: "gap.xl" }}
      pr={{ md: "16" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="subtle"
      bg="bg.card"
      _hover={{ borderColor: "fg.subtle" }}
    >
      <Tooltip
        content={datetime.full(props.alert.created_at)}
        positioning={{ placement: "left" }}
      >
        <Flex
          pos="absolute"
          top={{ base: "gap.md", md: "gap.xl" }}
          right={{ base: "gap.sm", md: "gap.lg" }}
          h={{ base: "5", md: "9" }}
          align="center"
          fontSize="sm"
          fontWeight="medium"
          color="fg.muted"
          whiteSpace="nowrap"
        >
          {datetime.relativeRounded(props.alert.created_at)}
        </Flex>
      </Tooltip>

      <Flex justify="space-between" align="center" mb={{ base: "gap.sm", md: "gap.lg" }}>
        <Flex align="center" gap="gap.sm" flexWrap="wrap" pr={{ base: "16", md: "0" }}>
          <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }}>
            {props.alert.email}
          </Text>
          <Badge
            {...pgTagStyle.base}
            bg={props.alert.is_active ? pgTagStyle.area.bg : pgTagStyle.workload.bg}
            color={props.alert.is_active ? pgTagStyle.area.fg : pgTagStyle.workload.fg}
            {...ids.set(
              props.alert.is_active
                ? ids.job.subscriptions.status.active
                : ids.job.subscriptions.status.inactive,
            )}
          >
            {props.alert.is_active ? "Active" : "Inactive"}
          </Badge>
        </Flex>

        <Flex gap="1" display={{ base: "none", md: "flex" }}>
          <AlertCardActions alert={props.alert} loading={loading} />
        </Flex>
      </Flex>

      {isHasFilters ? (
        <HStack gap={{ base: "gap.xs", md: "gap.md" }} flexWrap="wrap">
          {props.alert.is_remote && (
            <Badge
              {...pgTagStyle.base}
              bg={pgTagStyle.education.bg}
              color={pgTagStyle.education.fg}
            >
              Remote
            </Badge>
          )}
          {props.alert.is_orgs_highlighted && (
            <Badge
              {...pgTagStyle.base}
              bg={pgTagStyle.highlighted.bg}
              color={pgTagStyle.highlighted.fg}
            >
              Highlighted Orgs
            </Badge>
          )}
          {props.alert.salary_min != null && (
            <Badge
              {...pgTagStyle.base}
              bg={pgTagStyle.experience.bg}
              color={pgTagStyle.experience.fg}
            >
              Min Salary: {format.money(props.alert.salary_min)}
            </Badge>
          )}
          {props.alert.tags.map(tag => {
            const colors = tagColorByCategory(tag.category_name);
            return (
              <Badge
                key={tag.name}
                {...pgTagStyle.base}
                bg={colors.bg}
                color={colors.fg}
                maxW="100%"
              >
                <Text truncate>
                  {tag.category_name
                    ? `${format.capitalize(tag.category_name)}: ${tag.name}`
                    : tag.name}
                </Text>
              </Badge>
            );
          })}
        </HStack>
      ) : (
        <Text fontSize={{ base: "13px", md: "sm" }} color="fg.muted">
          All new jobs
        </Text>
      )}

      <Flex display={{ base: "flex", md: "none" }} gap="1" mt="gap.sm">
        <AlertCardActions alert={props.alert} loading={loading} />
      </Flex>
    </Stack>
  );
}

function AlertCardActions(props: {
  alert: AlertType;
  loading: ReturnType<typeof useIsLoading>;
}) {
  async function handleToggle() {
    await mutateAndRefetchMountedQueries(JobAlertToggleActiveMutation, {
      id_ext: props.alert.id_ext,
    });
  }

  async function handleRemove() {
    await mutateAndRefetchMountedQueries(JobAlertRemoveMutation, {
      id_ext: props.alert.id_ext,
    });
  }

  return (
    <>
      <IconButton
        aria-label={props.alert.is_active ? "Pause" : "Resume"}
        variant="ghost"
        size="sm"
        onClick={() => {
          props.loading.track(handleToggle);
        }}
        loading={props.loading.isActive}
        {...ids.set(ids.job.subscriptions.toggleBtn)}
      >
        {props.alert.is_active ? <LuPause /> : <LuPlay />}
      </IconButton>

      {!props.alert.is_active && (
        <IconButton
          aria-label="Remove"
          variant="ghost"
          size="sm"
          colorPalette="red"
          onClick={() => {
            props.loading.track(handleRemove);
          }}
          loading={props.loading.isActive}
          {...ids.set(ids.job.subscriptions.removeBtn)}
        >
          <LuTrash2 />
        </IconButton>
      )}
    </>
  );
}

const categoryColorMap: Record<string, { bg: string; fg: string }> = {
  area: pgTagStyle.area,
  experience: pgTagStyle.experience,
  education: pgTagStyle.education,
  workload: pgTagStyle.workload,
};

function tagColorByCategory(categoryName?: string | null): { bg: string; fg: string } {
  return (categoryName ? categoryColorMap[categoryName] : undefined) ?? pgTagStyle.area;
}
