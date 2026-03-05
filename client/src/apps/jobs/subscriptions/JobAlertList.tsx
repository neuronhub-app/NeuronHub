/**
 * #AI
 */

import {
  Badge,
  Card,
  Flex,
  Group,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuPause, LuPlay, LuTrash2 } from "react-icons/lu";
import { NavLink } from "react-router";
import { useJobUnsubscribeHandler } from "@/apps/jobs/subscriptions/useJobUnsubscribeHandler";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { graphql, type ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { datetime } from "@/utils/date-fns";
import { format } from "@/utils/format";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { useIsLoading } from "@/utils/useIsLoading";

export function JobAlertList(props: { unsubscribeAlertIdExt?: string }) {
  const { data, isLoadingFirstTime } = useApolloQuery(JobAlertListQuery);

  const unsubscribe = useJobUnsubscribeHandler(props.unsubscribeAlertIdExt);

  if (isLoadingFirstTime) {
    return <Text color="fg.muted">Loading subscriptions...</Text>;
  }

  const alerts = data?.job_alerts ?? [];

  return (
    <Stack gap="gap.lg" w="100%">
      {unsubscribe.isUnsubscribeRequest && <unsubscribe.Alert />}

      <HStack as="header" gap="gap.lg" flexWrap="wrap" justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Job Subscriptions
        </Text>
      </HStack>

      {alerts.length === 0 && (
        <Text color="fg.muted">
          No active subscriptions - subscribe on{" "}
          <Link asChild>
            <NavLink to={urls.jobs.list}>the Jobs page</NavLink>
          </Link>
          .
        </Text>
      )}

      <Stack gap="gap.md" {...ids.set(ids.job.subscriptions.list)}>
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </Stack>
    </Stack>
  );
}

type AlertType = NonNullable<ResultOf<typeof JobAlertListQuery>["job_alerts"]>[number];

function AlertCard(props: { alert: AlertType }) {
  const loading = useIsLoading();
  const isHasFilters =
    props.alert.tags.length > 0 ||
    props.alert.is_orgs_highlighted ||
    props.alert.is_remote ||
    props.alert.salary_min != null;

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
    <Card.Root
      {...ids.set(ids.job.subscriptions.card)}
      border="0"
      {...getOutlineBleedingProps()}
    >
      <Card.Body gap="gap.sm">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="gap.sm">
            <Text fontWeight="medium">{props.alert.email}</Text>
            <Badge
              colorPalette={props.alert.is_active ? "green" : "gray"}
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
            <IconButton
              aria-label={props.alert.is_active ? "Pause" : "Resume"}
              variant="ghost"
              size="sm"
              onClick={() => {
                loading.track(handleToggle);
              }}
              loading={loading.isActive}
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
                  loading.track(handleRemove);
                }}
                loading={loading.isActive}
                {...ids.set(ids.job.subscriptions.removeBtn)}
              >
                <LuTrash2 />
              </IconButton>
            )}
          </Flex>
        </Flex>

        <Flex justify="space-between" align="flex-end">
          {isHasFilters && (
            <Flex gap="gap.sm" flexWrap="wrap">
              {props.alert.is_remote && (
                <Badge variant="subtle" colorPalette="blue">
                  Remote
                </Badge>
              )}
              {props.alert.is_orgs_highlighted && (
                <Badge variant="subtle" colorPalette="yellow">
                  Highlighted Orgs
                </Badge>
              )}
              {props.alert.salary_min != null && (
                <Group attached colorPalette="teal">
                  <Badge>Min Salary</Badge>
                  <Badge variant="solid">{format.money(props.alert.salary_min)}</Badge>
                </Group>
              )}
              {props.alert.tags.map(tag => (
                <Group key={tag.name} attached colorPalette="teal">
                  {tag.category_name && <Badge>{tag.category_name}</Badge>}
                  <Badge variant="solid">{tag.name}</Badge>
                </Group>
              ))}
            </Flex>
          )}

          {!isHasFilters && (
            <Text fontSize="sm" color="fg.muted">
              All new jobs
            </Text>
          )}

          <Stack gap="gap.md" fontSize="xs" color="fg.subtle">
            <Tooltip
              content={datetime.full(props.alert.created_at)}
              positioning={{ placement: "bottom" }}
            >
              <Text whiteSpace="nowrap">{datetime.relative(props.alert.created_at)}</Text>
            </Tooltip>
          </Stack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}

export const JobAlertListQuery = graphql.persisted(
  "JobAlertList",
  graphql(`
    query JobAlertList {
      job_alerts {
        id
        id_ext
        email
        tags {
          name
          category_name
        }
        is_orgs_highlighted
        is_remote
        salary_min
        is_active
        created_at
        sent_count
      }
    }
  `),
);

const JobAlertToggleActiveMutation = graphql.persisted(
  "JobAlertToggleActive",
  graphql(`
    mutation JobAlertToggleActive($id_ext: UUID!) {
      job_alert_toggle_active(id_ext: $id_ext)
    }
  `),
);

const JobAlertRemoveMutation = graphql.persisted(
  "JobAlertRemove",
  graphql(`
    mutation JobAlertRemove($id_ext: UUID!) {
      job_alert_remove(id_ext: $id_ext)
    }
  `),
);
