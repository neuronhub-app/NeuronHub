/**
 * #quality-15% #AI
 * - 20% -> 15% adding 3 sections new/updated/removed by LLM
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapsible,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createPatch } from "diff";
import { html } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import "diff2html/bundles/css/diff2html.min.css";
import { LuChevronDown, LuEllipsisVertical } from "react-icons/lu";

import { admin } from "@neuronhub/shared/admin-urls";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";
import { useStateValtioSet } from "@neuronhub/shared/utils/useStateValtio";
import { ids } from "@/e2e/ids";
import type { ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";
import { JobVersionsApproveMutation, JobVersionsPendingQuery } from "./queries";

type VersionType = NonNullable<
  ResultOf<typeof JobVersionsPendingQuery>["job_versions_pending"]
>[number];

type Section = "new" | "updated" | "removed";

type VersionsSelected = ReturnType<typeof useStateValtioSet<string>>;

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

  const versionsBySection: Record<Section, VersionType[]> = {
    new: versions.filter(v => v.published === null && !v.draft.is_pending_removal),
    updated: versions.filter(v => v.published !== null && !v.draft.is_pending_removal),
    removed: versions.filter(v => v.draft.is_pending_removal),
  };

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

      <JobVersionSection
        section="new"
        label="New"
        versions={versionsBySection.new}
        versionsSelected={versionsSelected}
      />
      <JobVersionSection
        section="updated"
        label="Updated"
        versions={versionsBySection.updated}
        versionsSelected={versionsSelected}
      />
      <JobVersionSection
        section="removed"
        label="Removed"
        versions={versionsBySection.removed}
        versionsSelected={versionsSelected}
      />
    </Stack>
  );
}

const style = {
  heading: {
    fontSize: "2xl",
    fontWeight: "bold",
  },
  sectionHeading: {
    fontSize: "lg",
    fontWeight: "bold",
  },
  orgIcon: {
    boxSize: "1.5em",
    borderRadius: "sm",
    flexShrink: "0",
    objectFit: "contain",
  },
} as const;

function JobVersionSection(props: {
  section: Section;
  label: string;
  versions: VersionType[];
  versionsSelected: VersionsSelected;
}) {
  if (props.versions.length === 0) {
    return null;
  }

  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger asChild>
        <HStack cursor="pointer" py="gap.xs" userSelect="none">
          <LuChevronDown />
          <Text {...style.sectionHeading}>
            {props.label} ({props.versions.length})
          </Text>
        </HStack>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <Stack gap="gap.md" pt="gap.sm">
          {props.versions.map(version => (
            <JobVersionCard
              key={version.id}
              version={version}
              section={props.section}
              isSelected={props.versionsSelected.snap.has(version.id)}
              onToggle={() => {
                if (props.versionsSelected.mutable.has(version.id)) {
                  props.versionsSelected.mutable.delete(version.id);
                } else {
                  props.versionsSelected.mutable.add(version.id);
                }
              }}
            />
          ))}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function JobVersionCard(props: {
  version: VersionType;
  section: Section;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const orgLogoUrl = props.version.draft.org.logo?.url;
  const orgName = props.version.draft.org.name;

  return (
    <Card.Root
      onClick={props.onToggle}
      outline={props.isSelected ? "1px solid" : undefined}
      outlineColor={props.isSelected ? "primary" : ""}
      cursor="pointer"
      {...ids.set(ids.job.versions.card)}
    >
      <Card.Body gap="gap.sm" p="gap.md">
        <HStack gap="gap.sm" align="center">
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

          <Text flex="1" minW="0" fontSize="md" lineHeight="1.5em">
            {orgLogoUrl ? (
              <Image
                src={orgLogoUrl}
                alt={orgName}
                {...style.orgIcon}
                display="inline-block"
                verticalAlign="middle"
                mr="gap.xs"
                bg="bg.card"
              />
            ) : (
              <Flex
                {...style.orgIcon}
                display="inline-flex"
                verticalAlign="middle"
                mr="gap.xs"
                align="center"
                justify="center"
                bg="bg.emphasized"
                color="fg.muted"
                fontSize="xs"
                fontWeight="bold"
              >
                {orgName.charAt(0).toUpperCase()}
              </Flex>
            )}
            <Text as="span" fontWeight="bold">
              {orgName}
            </Text>
            <Text as="span" color="fg.muted">
              {" — "}
              {props.version.draft.title}
            </Text>
          </Text>

          {props.section === "removed" && <Badge colorPalette="red">removal</Badge>}
          {props.section === "new" && <Badge>new</Badge>}

          <JobVersionMenu
            draftId={props.version.draft.id}
            publishedId={props.version.published?.id ?? null}
          />
        </HStack>

        <JobVersionBody version={props.version} section={props.section} />
      </Card.Body>
    </Card.Root>
  );
}

function JobVersionBody(props: { version: VersionType; section: Section }) {
  if (props.section === "removed") {
    return null;
  }

  if (props.section === "new") {
    return (
      <Prose
        size="sm"
        maxW="none"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown from our backend
        dangerouslySetInnerHTML={{
          __html: markedConfigured.parse(props.version.draft_markdown),
        }}
      />
    );
  }

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
  );
}

function JobVersionMenu(props: { draftId: string; publishedId: string | null }) {
  const publishedUrl = props.publishedId
    ? `${admin.urls.jobs}${props.publishedId}/change/`
    : null;

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Job admin links"
          onClick={event => {
            event.stopPropagation();
          }}
        >
          <LuEllipsisVertical />
        </IconButton>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="draft" asChild>
              <Link
                href={`${admin.urls.jobs}${props.draftId}/change/`}
                target="_blank"
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                Draft in Django admin
              </Link>
            </Menu.Item>
            {publishedUrl && (
              <Menu.Item value="published" asChild>
                <Link
                  href={publishedUrl}
                  target="_blank"
                  onClick={event => {
                    event.stopPropagation();
                  }}
                >
                  Published in Django admin
                </Link>
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
