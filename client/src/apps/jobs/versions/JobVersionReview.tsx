/**
 * #AI
 */
import { Badge, Box, Button, Card, Checkbox, HStack, Stack, Text } from "@chakra-ui/react";
import { createPatch } from "diff";
import { html } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import "diff2html/bundles/css/diff2html.min.css";

import { useStateValtioSet } from "@neuronhub/shared/utils/useStateValtio";
import { ids } from "@/e2e/ids";
import type { ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";
import { JobVersionsApproveMutation, JobVersionsPendingQuery } from "./queries";

export function JobVersionReview() {
  const { data, isLoadingFirstTime } = useApolloQuery(JobVersionsPendingQuery);
  const loading = useIsLoading();

  const versionsSelected = useStateValtioSet<string>(null);

  if (isLoadingFirstTime) {
    return (
      <Text color="fg.muted" my="gap.md">
        Loading pending versions...
      </Text>
    );
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

  const isAllSelected = versionsSelected.snap.size === versions.length;

  function handleToggleAll() {
    if (isAllSelected) {
      versionsSelected.mutable.clear();
    } else {
      for (const version of versions) {
        versionsSelected.mutable.add(version.id);
      }
    }
  }

  async function handleApprove() {
    const result = await mutateAndRefetchMountedQueries(JobVersionsApproveMutation, {
      draft_ids: [...versionsSelected.snap].map(Number),
    });
    if (result.success) {
      versionsSelected.mutable.clear();
    }
  }

  return (
    <Stack gap="gap.lg" w="100%" my="gap.lg" {...ids.set(ids.job.versions.container)}>
      <HStack as="header" justify="space-between" wrap="wrap">
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
            disabled={versionsSelected.snap.size === 0}
            onClick={async () => {
              await loading.track(handleApprove);
            }}
            loading={loading.isActive}
            {...ids.set(ids.job.versions.approveBtn)}
          >
            Approve ({versionsSelected.snap.size})
          </Button>
        </HStack>
      </HStack>

      <Stack gap="gap.md">
        {versions.map(version => (
          <JobVersionCard
            key={version.id}
            version={version}
            isSelected={versionsSelected.snap.has(version.id)}
            onToggle={() => {
              if (versionsSelected.mutable.has(version.id)) {
                versionsSelected.mutable.delete(version.id);
              } else {
                versionsSelected.mutable.add(version.id);
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

function JobVersionCard(props: {
  version: VersionType;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const isNewDraft = props.version.published === null;
  const isRemoval = props.version.draft.is_pending_removal;

  const htmlDiff = html(
    createPatch(
      `${props.version.draft.title}.md`,
      props.version.published_markdown,
      props.version.draft_markdown,
    ),
    {
      outputFormat: "side-by-side",
      drawFileList: false,
      matching: "lines",
      diffStyle: "word",
      colorScheme: ColorSchemeType.AUTO,
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
      <Card.Body gap="gap.sm" p="gap.md">
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

          <Text
            fontWeight="bold"
            fontSize="md"
            textDecoration={isRemoval ? "line-through" : undefined}
          >
            {props.version.draft.title}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {props.version.draft.org.name}
          </Text>

          {isRemoval && <Badge colorPalette="red">removal</Badge>}
          {isNewDraft && !isRemoval && <Badge>new</Badge>}
        </HStack>

        {!isRemoval && (
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
              "& .d2h-file-wrapper": { border: 0, marginBottom: 0 },
              "& .d2h-file-side-diff": { overflow: "auto" },
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: diff2html output from our own backend data
            dangerouslySetInnerHTML={{ __html: htmlDiff }}
          />
        )}
      </Card.Body>
    </Card.Root>
  );
}
