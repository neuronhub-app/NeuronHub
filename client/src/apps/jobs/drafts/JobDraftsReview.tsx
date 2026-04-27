/**
 * #quality-15% #AI
 * - 20% -> 15%: 3 sections by LLM
 */
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapsible,
  Container,
  Flex,
  For,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  Portal,
  Spacer,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { createPatch } from "diff";
import { html } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import "diff2html/bundles/css/diff2html.min.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { LuChevronDown, LuEllipsisVertical, LuExternalLink } from "react-icons/lu";
import { NavLink } from "react-router";
import { useSnapshot } from "valtio";
import { proxySet } from "valtio/utils";

import { admin } from "@neuronhub/shared/admin-urls";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { icons } from "@neuronhub/shared/theme/icons";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { JobDraftsApproveMutation, JobDraftsQuery } from "@/apps/jobs/drafts/queries";
import { ids } from "@/e2e/ids";
import type { ID, ResultOf } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";

const sections = ["created", "updated", "deleted"] as const;
type DraftSection = (typeof sections)[number];

type DraftType = NonNullable<ResultOf<typeof JobDraftsQuery>["job_versions_pending"]>[number];

const draftsSelected = proxySet<ID>();

export function JobDraftsReview() {
  const { data, isLoadingFirstTime } = useApolloQuery(JobDraftsQuery);

  const drafts = data?.job_versions_pending ?? [];

  const draftsBySection = useMemo(
    () => ({
      created: drafts.filter(
        draft => draft.published === null && !draft.draft.is_pending_removal,
      ),
      updated: drafts.filter(
        draft => draft.published !== null && !draft.draft.is_pending_removal,
      ),
      deleted: drafts.filter(draft => draft.draft.is_pending_removal),
    }),
    [drafts],
  );

  if (isLoadingFirstTime) {
    return (
      <Text color="fg.muted" my="gap.md" px={style.px}>
        Loading pending drafts...
      </Text>
    );
  }
  if (drafts.length === 0) {
    return (
      <Stack gap="gap.md" w="100%">
        <Text {...style.heading}>Drafts Review</Text>
        <Text color="fg.muted" {...ids.set(ids.job.drafts.emptyState)}>
          No pending drafts to review.
        </Text>
      </Stack>
    );
  }

  function onSelectAllToggle() {
    if (draftsSelected.size === drafts.length) {
      draftsSelected.clear();
    } else {
      for (const draft of drafts) {
        draftsSelected.add(draft.id);
      }
    }
  }

  return (
    <Stack gap="gap.lg" w="100%" {...ids.set(ids.job.drafts.container)}>
      <JobDraftsNavbar
        draftsBySection={draftsBySection}
        draftsTotal={drafts.length}
        onSelectAllToggle={onSelectAllToggle}
      />

      <Container px={style.px} maxW="100%" display="flex" flexDir="column">
        <Text as="header" {...style.heading}>
          Drafts Review
        </Text>

        {sections.map(section => (
          <JobDraftsSection key={section} section={section} drafts={draftsBySection[section]} />
        ))}
      </Container>
    </Stack>
  );
}

function JobDraftsNavbar(props: {
  draftsBySection: Record<DraftSection, DraftType[]>;
  draftsTotal: number;
  onSelectAllToggle: () => void;
}) {
  const loading = useIsLoading();
  const navbarRef = useRef<HTMLDivElement>(null);

  const draftsSelectedSnap = useSnapshot(draftsSelected);

  const state = useStateValtio({
    sectionActive: sections[0] as DraftSection,
    jobsSeen: 0,
    jobsTotal: 0,
  });

  async function onPublish() {
    const result = await mutateAndRefetchMountedQueries(JobDraftsApproveMutation, {
      draft_ids: [...draftsSelected].map(Number),
    });
    if (result.success) {
      toast.success(
        `Published ${draftsSelected.size} ${draftsSelected.size > 1 ? "drafts" : "draft"}. Algolia will update in a ~minute.`,
        { duration: 6000 },
      );
      draftsSelected.clear();
    }
  }

  useEffect(() => {
    function update() {
      const navbarBottom = navbarRef.current?.getBoundingClientRect().bottom ?? 0;
      let active: DraftSection = sections[0];
      for (const section of sections) {
        const el = document.getElementById(jobDraftsSectionId(section));
        // +1 tolerates subpixel scroll landing
        if (el && el.getBoundingClientRect().top <= navbarBottom + 1) {
          active = section;
        }
      }
      state.mutable.sectionActive = active;

      const jobCards = document.querySelectorAll(`[data-testid="${ids.job.drafts.card}"]`);
      let jobsSeen = 0;
      for (const card of jobCards) {
        if (card.getBoundingClientRect().top < window.innerHeight) jobsSeen++;
      }
      state.mutable.jobsSeen = jobsSeen;
      state.mutable.jobsTotal = jobCards.length;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollToSection(section: DraftSection) {
    const el = document.getElementById(jobDraftsSectionId(section));
    if (!el) return;
    const navbarHeight = navbarRef.current?.getBoundingClientRect().height ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <HStack
      ref={navbarRef}
      pos="sticky"
      top="0"
      p={style.px}
      gap="gap.md"
      bg="bg.default_real"
      shadow="md"
      shadowColor="bg.backdrop / 50"
      zIndex="docked"
      {...ids.set(ids.job.drafts.navbar)}
    >
      <Tabs.Root
        defaultValue={sections[0]}
        value={state.snap.sectionActive}
        onValueChange={details => {
          scrollToSection(details.value as DraftSection);
        }}
        variant="enclosed"
        size="sm"
      >
        <Tabs.List>
          <For each={sections}>
            {section => (
              <Tabs.Trigger key={section} value={section} textTransform="capitalize">
                {section}{" "}
                <Text color="fg.subtle" fontSize="xs">
                  {props.draftsBySection[section].length}
                </Text>
              </Tabs.Trigger>
            )}
          </For>
        </Tabs.List>
      </Tabs.Root>

      <Text color="fg.muted" fontFamily="monospace">
        {state.snap.jobsSeen}/{state.snap.jobsTotal}
      </Text>

      <Spacer />

      <Button
        size="sm"
        variant="outline"
        onClick={props.onSelectAllToggle}
        {...ids.set(ids.job.drafts.selectAllCheckbox)}
      >
        {draftsSelectedSnap.size === props.draftsTotal ? "Unselect all" : "Select all"}
      </Button>

      <Button
        size="sm"
        disabled={draftsSelectedSnap.size === 0}
        loading={loading.isActive}
        onClick={async () => {
          await loading.track(onPublish);
        }}
        {...ids.set(ids.job.drafts.approveBtn)}
      >
        Publish <Text>{draftsSelectedSnap.size}</Text>
      </Button>
    </HStack>
  );
}

function jobDraftsSectionId(section: DraftSection) {
  return `job-versions-section-${section}`;
}

const style = {
  px: "gap.sm",
  heading: {
    fontSize: "2xl",
    fontWeight: "bold",
  },
  sectionHeading: {
    fontSize: "lg",
    fontWeight: "bold",
  },
  orgIcon: {
    boxSize: 6,
    borderRadius: "sm",
    flexShrink: "0",
    objectFit: "contain",
  },
} as const;

function JobDraftsSection(props: { section: DraftSection; drafts: DraftType[] }) {
  if (props.drafts.length === 0) {
    return null;
  }

  return (
    <Collapsible.Root asChild defaultOpen>
      <Box id={jobDraftsSectionId(props.section)}>
        <Collapsible.Trigger asChild>
          <HStack cursor="pointer" py="gap.xs" userSelect="none">
            <LuChevronDown />
            <Text {...style.sectionHeading} textTransform="capitalize">
              {props.section}
            </Text>
          </HStack>
        </Collapsible.Trigger>

        <Collapsible.Content overflow="visible">
          <Stack gap="gap.md">
            {props.drafts.map(draft => (
              <JobDraftCard key={draft.id} draft={draft} section={props.section} />
            ))}
          </Stack>
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  );
}

function JobDraftCard(props: { draft: DraftType; section: DraftSection }) {
  const orgLogoUrl = props.draft.draft.org.logo?.url;
  const orgName = props.draft.draft.org.name;

  const draftsSelectedSnap = useSnapshot(draftsSelected);

  const toggleDraftSelection = useCallback(() => {
    if (draftsSelected.has(props.draft.id)) {
      draftsSelected.delete(props.draft.id);
    } else {
      draftsSelected.add(props.draft.id);
    }
  }, [props.draft.id]);

  const outline = useMemo(() => getOutlineBleedingProps("muted"), []);

  return (
    <Card.Root
      onClick={toggleDraftSelection}
      cursor="pointer"
      border="0"
      {...outline}
      outlineColor={
        draftsSelectedSnap.has(props.draft.id) ? "blue.border" : outline.outlineColor
      }
      bg={draftsSelectedSnap.has(props.draft.id) ? "blue.subtle" : ""}
      {...ids.set(ids.job.drafts.card)}
    >
      <Card.Body gap="gap.sm" p="gap.md" py="gap.sm">
        <HStack gap="gap.sm" align="center">
          <Checkbox.Root
            checked={draftsSelectedSnap.has(props.draft.id)}
            onCheckedChange={toggleDraftSelection}
            onClick={event => {
              event.stopPropagation();
            }}
            colorPalette="blue"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>

          <Flex flex="1" align="center" gap="gap.xs" fontSize="md" lineHeight="1.5em">
            {orgLogoUrl ? (
              <Image src={orgLogoUrl} alt={orgName} {...style.orgIcon} bg="bg.card" />
            ) : (
              <Flex
                {...style.orgIcon}
                display="inline-flex"
                verticalAlign="middle"
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
              {props.draft.draft.title}
            </Text>
            <Text as="span">| {orgName}</Text>
          </Flex>
          {props.section === "deleted" && <Badge colorPalette="red">deletion</Badge>}
          {props.section === "created" && <Badge>created</Badge>}
          {props.draft.draft.url_external && (
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              aria-label="Open external URL"
              onClick={event => {
                event.stopPropagation();
              }}
            >
              <Link href={props.draft.draft.url_external} target="_blank">
                <LuExternalLink />
              </Link>
            </IconButton>
          )}
          {props.draft.published && (
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              aria-label="Open published job"
              onClick={event => event.stopPropagation()}
            >
              <Link asChild>
                <NavLink to={urls.jobs.slug(props.draft.published.slug)} target="_blank">
                  <icons.pg.job_url />
                </NavLink>
              </Link>
            </IconButton>
          )}
          <JobDraftMenu
            draftId={props.draft.draft.id}
            publishedId={props.draft.published?.id ?? null}
          />
        </HStack>

        <JobDraftBody draft={props.draft} section={props.section} />
      </Card.Body>
    </Card.Root>
  );
}

function JobDraftBody(props: { draft: DraftType; section: DraftSection }) {
  if (props.section === "deleted") {
    return null;
  }

  if (props.section === "created") {
    const mdWoDuplicatedJobTitle = props.draft.draft_markdown.split("\n").slice(1).join("\n");
    return (
      <Prose
        size="sm"
        maxW="none"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: BE
        dangerouslySetInnerHTML={{ __html: markedConfigured.parse(mdWoDuplicatedJobTitle) }}
      />
    );
  }

  const htmlDiff = html(
    createPatch(
      `${props.draft.draft.title}.md`,
      props.draft.published_markdown,
      props.draft.draft_markdown,
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
        "& .d2h-code-line-ctn": {
          whiteSpace: "pre-wrap",
        },
        "& .d2h-file-wrapper": { border: 0, marginBottom: 0 },
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: BE
      dangerouslySetInnerHTML={{ __html: htmlDiff }}
    />
  );
}

function JobDraftMenu(props: { draftId: string; publishedId: string | null }) {
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
                _hover={{ cursor: "pointer" }}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                Admin Draft
              </Link>
            </Menu.Item>
            {publishedUrl && (
              <Menu.Item value="published" asChild>
                <Link
                  href={publishedUrl}
                  target="_blank"
                  _hover={{ cursor: "pointer" }}
                  onClick={event => {
                    event.stopPropagation();
                  }}
                >
                  Admin Published
                </Link>
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
