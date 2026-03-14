/**
 * #AI
 */
import { Box, Button, Card, Checkbox, HStack, Stack, Text } from "@chakra-ui/react";
import { createPatch } from "diff";
import { html } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import "diff2html/bundles/css/diff2html.min.css";
import { useColorMode } from "@/components/ui/color-mode";
import { ids } from "@/e2e/ids";
import type { ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";
import { useStateValtioSet } from "@neuronhub/shared/utils/useStateValtio";
import { JobVersionsApproveMutation, JobVersionsPendingQuery } from "./queries";

export function JobVersionReview() {
  const { data, isLoadingFirstTime } = useApolloQuery(JobVersionsPendingQuery);
  const selected = useStateValtioSet<string>(null);
  const loading = useIsLoading();
  const colorMode = useColorMode();

  if (isLoadingFirstTime) {
    return <Text color="fg.muted">Loading pending versions...</Text>;
  }

  const versions = data?.job_versions_pending ?? [];

  if (versions.length === 0) {
    return (
      <Stack gap="gap.lg" w="100%">
        <Text {...style.heading}>Job Version Review</Text>
        <Text color="fg.muted" {...ids.set(ids.job.versions.emptyState)}>
          No pending versions to review.
        </Text>
      </Stack>
    );
  }

  const isAllSelected = selected.snap.size === versions.length;

  function handleToggleAll() {
    if (isAllSelected) {
      selected.mutable.clear();
    } else {
      for (const v of versions) {
        selected.mutable.add(v.id);
      }
    }
  }

  async function handleApprove() {
    const result = await mutateAndRefetchMountedQueries(JobVersionsApproveMutation, {
      draft_ids: [...selected.snap].map(Number),
    });
    if (result.success) {
      selected.mutable.clear();
    }
  }

  return (
    <Stack gap="gap.lg" w="100%" {...ids.set(ids.job.versions.container)}>
      <HStack as="header" justify="space-between" flexWrap="wrap">
        <Text {...style.heading}>Job Version Review</Text>

        <HStack gap="gap.md">
          <Checkbox.Root
            checked={isAllSelected}
            onCheckedChange={handleToggleAll}
            {...ids.set(ids.job.versions.selectAllCheckbox)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Select all ({versions.length})</Checkbox.Label>
          </Checkbox.Root>

          <Button
            disabled={selected.snap.size === 0}
            onClick={() => {
              loading.track(handleApprove);
            }}
            loading={loading.isActive}
            {...ids.set(ids.job.versions.approveBtn)}
          >
            Approve ({selected.snap.size})
          </Button>
        </HStack>
      </HStack>

      <Stack gap="gap.md">
        {versions.map(version => (
          <VersionCard
            key={version.id}
            version={version}
            diffColorScheme={
              colorMode.colorMode === "dark" ? ColorSchemeType.DARK : ColorSchemeType.LIGHT
            }
            isSelected={selected.snap.has(version.id)}
            onToggle={() => {
              if (selected.mutable.has(version.id)) {
                selected.mutable.delete(version.id);
              } else {
                selected.mutable.add(version.id);
              }
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

const style = {
  heading: {
    fontSize: "2xl",
    fontWeight: "bold",
  },
} as const;

type VersionType = NonNullable<
  ResultOf<typeof JobVersionsPendingQuery>["job_versions_pending"]
>[number];

function VersionCard(props: {
  version: VersionType;
  diffColorScheme: ColorSchemeType;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const htmlDiff = html(
    createPatch(
      props.version.draft.title,
      props.version.published_markdown,
      props.version.draft_markdown,
      "Published",
      "Draft",
    ),
    {
      outputFormat: "side-by-side",
      drawFileList: false,
      matching: "lines",
      diffStyle: "word",
      colorScheme: props.diffColorScheme,
    },
  );

  return (
    <Card.Root
      onClick={props.onToggle}
      outline={props.isSelected ? "1px solid" : undefined}
      outlineColor={props.isSelected ? "primary" : ""}
      cursor="pointer"
      {...ids.set(ids.job.versions.card)}
    >
      <Card.Body gap="gap.sm">
        <HStack gap="gap.sm">
          <Checkbox.Root
            checked={props.isSelected}
            onCheckedChange={props.onToggle}
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>

          <Text fontWeight="bold" fontSize="md">
            {props.version.draft.title}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {props.version.draft.org.name}
          </Text>
        </HStack>

        <Box
          overflow="auto"
          fontSize="sm"
          css={{
            "& .d2h-wrapper": { margin: 0 },
            "& .d2h-file-header": { display: "none" },
            "& .d2h-code-side-linenumber": { display: "none" },
            "& .d2h-code-line-prefix": { display: "none" },
            "& .d2h-info": { display: "none" },
            "& .d2h-code-side-line": { padding: 0 },
            "& .d2h-file-wrapper": { border: 0 },
            "& .d2h-file-side-diff": { overflow: "auto" },
          }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: diff2html output from our own backend data
          dangerouslySetInnerHTML={{ __html: htmlDiff }}
        />
      </Card.Body>
    </Card.Root>
  );
}
