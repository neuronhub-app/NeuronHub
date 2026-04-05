/**
 * #quality-20%
 *
 * todo ! refac: replace by [[JobAlertList.tsx]] with [[JsxStyleProps]] - they're identical.
 * But this had layout bugs I fixed. Not sure what issues they were addressing - in my testing appeared to be redundant.
 */
import { layout } from "@/sites/pg/PgLayoutConfig";
import {
  Badge,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  IconButtonProps,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
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

  const alerts = data?.job_alerts ?? [];

  return (
    <Container
      display="flex"
      flexDirection="column"
      gap="gap.lg"
      w="100%"
      pt={layout.style.navbar.paddingX}
      pb={{ base: "gap.lg", md: "gap.xl" }}
    >
      <Heading size="3xl">Job Alerts</Heading>

      {unsubscribe.isUnsubscribeRequest && <unsubscribe.Alert />}

      {isLoadingFirstTime && <Text color="fg.muted">Loading subscriptions...</Text>}

      {!isLoadingFirstTime && alerts.length === 0 && (
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
    </Container>
  );
}

type AlertType = NonNullable<ResultOf<typeof JobAlertListQuery>["job_alerts"]>[number];

function PgAlertCard(props: { alert: AlertType }) {
  // #quality-1%
  // todo ! fix: useClearRefinements().canRefine or another method
  // see [[adding-job-alert-filters.mdx]] checklist
  const isHasFilters =
    props.alert.tags.length > 0 ||
    props.alert.locations.length > 0 ||
    props.alert.is_orgs_highlighted ||
    props.alert.is_remote ||
    props.alert.salary_min != null ||
    props.alert.is_exclude_no_salary ||
    props.alert.is_exclude_career_capital ||
    props.alert.is_exclude_profit_for_good;

  const style = {
    badge: {
      size: { base: "xs", md: "md" },
      h: { base: "initial", lg: "" },
    },
  } as const;

  return (
    <Stack
      {...ids.set(ids.job.subscriptions.card)}
      pos="relative"
      gap="0"
      p={{ base: "gap.sm", md: "gap.xl" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="subtle"
      bg="bg.card"
    >
      {/* card - row top */}
      <Flex
        justify="space-between"
        align="center"
        mb={{ base: "gap.xs", md: "gap.lg" }}
        w="full"
      >
        <HStack justify="space-between" w="full" align="flex-start">
          <Flex align="center" gap="gap.sm" flexWrap="wrap">
            <Text fontWeight="semibold" fontSize={{ base: "sm", md: "lg" }}>
              {props.alert.email}
            </Text>

            <Badge
              {...style.badge}
              variant={props.alert.is_active ? "pg-area" : "pg-workload"}
              {...ids.set(
                props.alert.is_active
                  ? ids.job.subscriptions.status.active
                  : ids.job.subscriptions.status.inactive,
              )}
            >
              {props.alert.is_active ? "Active" : "Inactive"}
            </Badge>
          </Flex>

          <Flex gap="1">
            <AlertCardActions alert={props.alert} />
          </Flex>
        </HStack>
      </Flex>

      {/* card - row bottom */}
      <HStack justify="space-between" align="flex-end">
        {isHasFilters ? (
          <HStack gap={{ base: "gap.xs", md: "gap.md" }} flexWrap="wrap">
            {props.alert.is_remote && (
              <Badge {...style.badge} variant="pg-education">
                Remote
              </Badge>
            )}
            {props.alert.is_orgs_highlighted && (
              <Badge {...style.badge} variant="pg-highlighted">
                Highlighted Orgs
              </Badge>
            )}
            {props.alert.salary_min != null && (
              <Badge {...style.badge} variant="pg-experience">
                Min Salary: {format.money(props.alert.salary_min)}
              </Badge>
            )}
            {props.alert.is_exclude_no_salary && (
              <Badge {...style.badge} variant="pg-experience">
                Exclude no salary
              </Badge>
            )}
            {props.alert.is_exclude_career_capital && (
              <Badge {...style.badge} variant="pg-area">
                Exclude Career Capital
              </Badge>
            )}
            {props.alert.is_exclude_profit_for_good && (
              <Badge {...style.badge} variant="pg-area">
                Exclude Profit for Good
              </Badge>
            )}
            {props.alert.locations.map(loc => (
              <Badge {...style.badge} key={loc.name} variant="pg-education">
                {loc.name}
              </Badge>
            ))}
            {props.alert.tags.map(tag => (
              <Badge
                {...style.badge}
                key={tag.name}
                variant={badgeVariantByCategory(tag.category_name) as never}
                maxW="100%"
              >
                <Text truncate>
                  {tag.category_name
                    ? `${format.capitalize(tag.category_name)}: ${tag.name}`
                    : tag.name}
                </Text>
              </Badge>
            ))}
          </HStack>
        ) : (
          <Text fontSize={{ base: "13px", md: "sm" }} color="fg.muted">
            All new jobs
          </Text>
        )}

        <Tooltip
          content={datetime.full(props.alert.created_at)}
          positioning={{ placement: "left" }}
        >
          <Flex
            align="flex-start"
            mb="-2px"
            fontSize={{ base: "2xs", md: "sm" }}
            color="fg.muted"
            whiteSpace="nowrap"
          >
            {datetime.relativeRounded(props.alert.created_at)}
          </Flex>
        </Tooltip>
      </HStack>
    </Stack>
  );
}

function AlertCardActions(props: { alert: AlertType }) {
  const loading = useIsLoading();

  const style = {
    size: ["2xs", "2xs", "sm"],
  } satisfies IconButtonProps;

  return (
    <Flex gap={["gap.xs", "gap.sm", "gap.md"]}>
      {/* Delete */}
      {!props.alert.is_active && (
        <IconButton
          {...style}
          aria-label="Delete"
          variant="subtle"
          colorPalette="red"
          onClick={async () => {
            await loading.track(() =>
              mutateAndRefetchMountedQueries(JobAlertRemoveMutation, {
                id_ext: props.alert.id_ext,
              }),
            );
          }}
          loading={loading.isActive}
          {...ids.set(ids.job.subscriptions.removeBtn)}
        >
          <LuTrash2 />
        </IconButton>
      )}

      {/* Pause */}
      <IconButton
        {...style}
        aria-label={props.alert.is_active ? "Pause" : "Resume"}
        variant="subtle"
        onClick={async () => {
          await loading.track(() =>
            mutateAndRefetchMountedQueries(JobAlertToggleActiveMutation, {
              id_ext: props.alert.id_ext,
            }),
          );
        }}
        loading={loading.isActive}
        {...ids.set(ids.job.subscriptions.toggleBtn)}
      >
        {props.alert.is_active ? <LuPause /> : <LuPlay />}
      </IconButton>
    </Flex>
  );
}

const badgeCategoryVariantMap: Record<string, string> = {
  area: "pg-area",
  experience: "pg-experience",
  education: "pg-education",
  workload: "pg-workload",
};

function badgeVariantByCategory(categoryName?: string | null): string {
  return (categoryName ? badgeCategoryVariantMap[categoryName] : undefined) ?? "pg-area";
}
