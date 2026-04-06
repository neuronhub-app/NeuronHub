import {
  Badge,
  Box,
  Button,
  Clipboard,
  Collapsible,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Prose } from "@neuronhub/shared/components/ui/prose";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import type { BaseHit, Hit } from "instantsearch.js";
import { IoLocationSharp } from "react-icons/io5";
import { LuChevronDown, LuExternalLink, LuLink } from "react-icons/lu";
import { Highlight, Snippet, useInstantSearch } from "react-instantsearch";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { appendUtmSource } from "@/sites/pg/siteConfigState";
import { toast } from "@/utils/toast";

const style = {
  markHighlight: {
    "& mark": { bg: "yellow.200", color: "black", borderRadius: "2px", px: "1px" },
  },
  duration: "slow",
} as const;

type TagGroup = {
  tags: { name: string }[];
  attribute: string;
  multipleLabel: string;
  variant: string;
};

const tagsHidden = ["Undergraduate Degree or Less", "Full-Time", "Other"];

function hasDescriptionMatch(jobHit: Hit<BaseHit>): boolean {
  // @ts-expect-error #bad-infer Algolia _highlightResult is untyped
  return jobHit._highlightResult?.description?.matchLevel !== "none";
}

const CardState = {
  Closed: "Closed",
  OpenBySearchPreview: "OpenBySearchPreview",
  OpenByUser: "OpenByUser",
} as const;
type CardState = (typeof CardState)[keyof typeof CardState];

export function JobCard(props: {
  job: JobFragmentType;
  isSearchActive?: boolean;
  isInitiallyOpen?: boolean;
}) {
  const { results } = useInstantSearch();

  const state = useStateValtio<{ card: CardState }>({
    card: props.isInitiallyOpen ? CardState.OpenByUser : CardState.Closed,
  });

  const isHighlightable = !!props.isSearchActive && "_highlightResult" in props.job;
  const jobHit = props.job as unknown as Hit<BaseHit>;
  const hasDescriptionHit = isHighlightable && !!results.query && hasDescriptionMatch(jobHit);

  const cardState =
    state.snap.card === CardState.OpenByUser
      ? CardState.OpenByUser
      : hasDescriptionHit
        ? CardState.OpenBySearchPreview
        : CardState.Closed;

  function toggleCardCollapse() {
    const isOpenByUser = state.mutable.card === CardState.OpenByUser;
    state.mutable.card = isOpenByUser ? CardState.Closed : CardState.OpenByUser;
  }

  const isOpen = cardState === CardState.OpenByUser;
  const borderColor = isOpen ? "brand.black" : "subtle";
  const borderColorHover = "brand.black";
  const boxShadowHover = isOpen ? "0 0 0 1px {colors.brand.black}" : undefined;

  return (
    <Stack
      as="article"
      className="group"
      pos="relative"
      gap="0"
      p={{ base: "gap.md", md: "gap.xl" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ borderColor: borderColorHover, boxShadow: boxShadowHover }}
      transition="border-color"
      transitionDuration={style.duration}
      bg="bg.card"
      fontFamily="body"
      css={style.markHighlight}
      {...ids.set(ids.job.card.container)}
      data-id={props.job.id}
    >
      <Stack
        gap="gap.sm"
        mb={{ base: cardState === CardState.OpenByUser ? "gap.md" : "0", md: "gap.lg" }}
      >
        <Flex gap={{ base: "gap.sm", md: "gap.lg" }}>
          {props.job.org?.logo ? (
            <Image
              src={props.job.org.logo.url}
              w={{ base: "60px", md: "90px" }}
              h={{ base: "60px", md: "90px" }}
              flexShrink="0"
              borderRadius="sm"
              objectFit="contain"
              bg="bg.card"
            />
          ) : (
            <Flex
              w={{ base: "60px", md: "90px" }}
              h={{ base: "60px", md: "90px" }}
              flexShrink="0"
              borderRadius="sm"
              bg="brand.green.light"
              align="center"
              justify="center"
              color="white"
              fontSize={{ base: "xl", md: "3xl" }}
              fontWeight="bold"
              fontFamily="heading"
            >
              {props.job.org?.name?.charAt(0)?.toUpperCase()}
            </Flex>
          )}

          <Flex flex="1" minW="0" justify="space-between" gap="gap.md">
            <VStack
              align="flex-start"
              justify={{ md: "space-between" }}
              gap={{ base: "3px", md: "0" }}
            >
              <JobTitleLink
                job={props.job}
                isHighlightable={isHighlightable}
                jobHit={jobHit}
                isOpen={isOpen}
              />

              <JobOrgLink
                job={props.job}
                isHighlightable={isHighlightable}
                jobHit={jobHit}
                isOpen={isOpen}
              />

              <Flex
                display={{ base: "none", md: "flex" }}
                gap="1"
                align="center"
                overflow="hidden"
                w="full"
                fontSize={{ base: "13px", md: "sm" }}
                lineHeight={{ base: "18px", md: "20px" }}
              >
                <Icon boxSize="4" color="fg.muted" ml="-3px">
                  <IoLocationSharp />
                </Icon>
                <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
                  <JobLocations job={props.job} />
                </Flex>
              </Flex>
            </VStack>

            <Tooltip
              content={datetime.full(props.job.posted_at)}
              positioning={{ placement: "left" }}
            >
              <Flex
                display={{ base: "none", md: "flex" }}
                h="28px"
                align="center"
                fontSize="sm"
                fontWeight="medium"
                color="fg.muted"
                whiteSpace="nowrap"
                flexShrink="0"
              >
                {datetime.relativeRounded(props.job.posted_at)}
              </Flex>
            </Tooltip>
          </Flex>
        </Flex>

        <Flex
          display={{ base: "flex", md: "none" }}
          align="center"
          gap="1"
          pr="9"
          fontSize={{ base: "13px", md: "sm" }}
          lineHeight={{ base: "18px", md: "20px" }}
        >
          <Icon boxSize="4" color="fg.muted" ml="-3px">
            <IoLocationSharp />
          </Icon>
          <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
            <JobLocations job={props.job} />
          </Flex>
        </Flex>
      </Stack>

      <Box
        display={{ base: cardState !== CardState.Closed ? "block" : "none", md: "block" }}
        mb={{
          base: cardState !== CardState.Closed ? "gap.md" : "0",
          md: cardState !== CardState.Closed ? "gap.lg" : "0",
        }}
        pos="relative"
        transition="margin"
        transitionDuration={style.duration}
      >
        <JobTagGroups
          job={props.job}
          highlightable={isHighlightable ? ["tags_area"] : []}
          jobHit={jobHit}
          isOrgHighlighted={props.job.org?.is_highlighted}
        />
      </Box>

      {cardState === CardState.OpenBySearchPreview && (
        <Stack gap="gap.sm" mb={{ base: "gap.md", md: "gap.lg" }}>
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Job Description
          </Text>
          <Box fontSize="sm" color="fg">
            <Snippet attribute="description" hit={jobHit} />
          </Box>
        </Stack>
      )}

      <Collapsible.Root open={isOpen}>
        <Collapsible.Content animationDuration={style.duration}>
          <JobExpanded job={props.job} />
        </Collapsible.Content>
      </Collapsible.Root>

      <Box
        onClick={toggleCardCollapse}
        pos="absolute"
        inset="0"
        borderRadius="lg"
        zIndex="1"
        cursor="pointer"
      />

      <Flex
        pos="absolute"
        bottom={{ base: "8px", md: "gap.md" }}
        right={{ base: "gap.sm", md: "gap.lg" }}
        color={borderColor}
        _groupHover={{ color: borderColorHover }}
      >
        <LuChevronDown
          size={24}
          style={{
            transform: isOpen ? "rotate(180deg)" : undefined,
            transition: "transform 0.25s ease",
          }}
        />
      </Flex>
    </Stack>
  );
}

function JobExpanded(props: { job: JobFragmentType }) {
  return (
    <Stack gap={{ base: "gap.md", md: "gap.lg" }}>
      {props.job.description && (
        <Stack gap="0">
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Job Description
          </Text>
          <Prose
            size="sm"
            maxW="none"
            css={{
              "& ul > li::marker": { color: "brand.black" },
              "& ul": { paddingInlineStart: "1em" },
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
            dangerouslySetInnerHTML={{
              __html: markedConfigured.parse(props.job.description),
            }}
          />
        </Stack>
      )}
      <Flex gap="gap.md" flexDirection={{ base: "column", md: "row" }}>
        <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Application Deadline
          </Text>
          <Text fontSize="sm">
            {props.job.closes_at ? datetime.date(props.job.closes_at) : "Rolling applications"}
          </Text>
        </Stack>
        {(props.job.salary_text || props.job.salary_min) && (
          <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
            <Text fontSize="sm" color="fg.muted" fontWeight="medium">
              Salary
            </Text>
            <Text fontSize="sm">
              {props.job.salary_text || `From $${props.job.salary_min!.toLocaleString("en-US")}`}
            </Text>
          </Stack>
        )}
      </Flex>
      {props.job.org?.description && (
        <Stack gap={{ base: "gap.sm", md: "gap.xs" }}>
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            About the Organization
          </Text>
          <Text fontSize="sm">{props.job.org.description}</Text>
        </Stack>
      )}
      <Flex gap="gap.md" align="center" w="fit-content" pos="relative" zIndex="2">
        {props.job.url_external && (
          <Button
            asChild
            variant="pg-primary"
            w={{ base: "150px", md: "190px" }}
            h="10"
            focusRingColor="transparent"
          >
            <Link
              href={appendUtmSource(props.job.url_external_with_utm || props.job.url_external)}
              target="_blank"
              rel="noopener noreferrer"
              textDecoration="none"
              _hover={{ textDecoration: "none" }}
            >
              Open Listing
              <Icon boxSize="4" position="relative" top="-1px">
                <LuExternalLink />
              </Icon>
            </Link>
          </Button>
        )}

        <Clipboard.Root value={`${window.location.origin}/${props.job.slug}`}>
          <Tooltip content="Copy link" positioning={{ placement: "right" }} openDelay={1_500}>
            <Clipboard.Trigger asChild>
              <Button
                variant="ghost"
                h="10"
                w="10"
                aria-label="Share"
                size="sm"
                onClick={async () => {
                  toast.success("Link copied");
                }}
              >
                <Clipboard.Indicator>
                  <Icon boxSize="5">
                    <LuLink />
                  </Icon>
                </Clipboard.Indicator>
              </Button>
            </Clipboard.Trigger>
          </Tooltip>
        </Clipboard.Root>
      </Flex>
    </Stack>
  );
}

function locationTags(locations: JobFragmentType["locations"]): string[] {
  if (!locations) {
    return [];
  }

  if (locations.length <= 3) {
    return locations.map(loc => loc.name);
  }

  const remotes = locations.filter(loc => loc.is_remote);
  if (remotes.length === 0) {
    // 4+ onsite
    return ["Multiple Locations"];
  }

  if (locations.filter(loc => !loc.is_remote).length === 0) {
    return ["Remote, Multiple Locations"];
  }

  if (remotes.length === 1) {
    return ["Multiple Locations", remotes[0]?.name ?? "Remote"];
  }

  return ["Multiple Locations", "Remote, Multiple Locations"];
}

function LocationDot() {
  return (
    <Box
      as="span"
      display="inline-block"
      w="3px"
      h="3px"
      mx="gap.xs"
      borderRadius="full"
      bg="fg.muted"
      verticalAlign="middle"
      pos="relative"
      top="-1px"
    />
  );
}

function JobLocations(props: { job: JobFragmentType }) {
  const tags = locationTags(props.job.locations);
  return (
    <Text overflow="hidden" minW="0" fontSize="sm" textOverflow="ellipsis" whiteSpace="nowrap">
      {tags.map((tag, index) => (
        <span key={tag}>
          {index > 0 && <LocationDot />}
          {tag}
        </span>
      ))}
    </Text>
  );
}

function JobOrgLink(props: {
  job: JobFragmentType;
  isHighlightable: boolean;
  jobHit: Hit<BaseHit>;
  isOpen: boolean;
}) {
  const orgName = props.isHighlightable ? (
    <Highlight attribute={["org", "name"]} hit={props.jobHit} />
  ) : (
    props.job.org?.name
  );

  const textStyle = {
    fontSize: { base: "13px", md: "md" },
    lineHeight: { base: "18px", md: "24px" },
    fontWeight: "medium",
    color: "fg",
  } as const;

  if (!props.job.org?.website) {
    return <Flex {...textStyle}>{orgName}</Flex>;
  }

  const aboveOverlay = props.isOpen ? { pos: "relative" as const, zIndex: "2" } : {};

  return (
    <Flex align="center" gap="gap.xs" {...aboveOverlay}>
      <Link
        href={appendUtmSource(props.job.org.website_with_utm || props.job.org.website)}
        target="_blank"
        rel="noopener noreferrer"
        {...textStyle}
        textDecoration="none"
        _hover={{ textDecoration: "underline", color: "currentColor" }}
      >
        {orgName}
      </Link>
    </Flex>
  );
}

function JobTitleLink(props: {
  job: JobFragmentType;
  isHighlightable?: boolean;
  jobHit: Hit<BaseHit>;
  isOpen: boolean;
}) {
  const title = props.isHighlightable ? (
    <Highlight attribute="title" hit={props.jobHit} />
  ) : (
    props.job.title
  );

  const headingStyle = {
    fontSize: { base: "17px", md: "xl" },
    lineHeight: { base: "21px", md: "28px" },
    fontWeight: "semibold",
    fontFamily: "heading",
    color: "fg",
  } as const;

  const aboveOverlay =
    props.isOpen && props.job.url_external ? { pos: "relative" as const, zIndex: "2" } : {};

  return (
    <Heading {...headingStyle} {...aboveOverlay}>
      {props.isOpen && props.job.url_external ? (
        <Link
          href={appendUtmSource(props.job.url_external_with_utm || props.job.url_external)}
          target="_blank"
          rel="noopener noreferrer"
          color="fg"
          textDecoration="none"
          _hover={{ textDecoration: "underline", color: "currentColor" }}
        >
          {title}
        </Link>
      ) : (
        title
      )}
    </Heading>
  );
}

const partTimeNames = ["Part-Time (50–80% FTE)", "Part-Time (<50% FTE)"];

function workloadMultipleLabel(tags: { name: string }[]): string {
  const hasFullTime = tags.some(tag => tag.name === "Full-Time");
  const hasAnyPartTime = tags.some(tag => partTimeNames.includes(tag.name));
  if (hasFullTime && hasAnyPartTime) {
    return "Full-Time or Part-Time";
  }
  if (tags.every(tag => partTimeNames.includes(tag.name))) {
    return "Part-Time";
  }
  return "Multiple Role Types";
}

function JobTagGroups(props: {
  job: JobFragmentType;
  highlightable: string[];
  jobHit: Hit<BaseHit>;
  isOrgHighlighted?: boolean;
}) {
  const tagGroups: TagGroup[] = [
    {
      tags: props.job.tags_area,
      attribute: "tags_area",
      multipleLabel: "Multiple Cause Areas",
      variant: "pg-area",
    },
    {
      tags: props.job.tags_experience,
      attribute: "tags_experience",
      multipleLabel: "Multiple Experience Levels",
      variant: "pg-experience",
    },
    {
      tags: props.job.tags_education,
      attribute: "tags_education",
      multipleLabel: "Multiple Education Requirements",
      variant: "pg-education",
    },
    {
      tags: props.job.tags_workload,
      attribute: "tags_workload",
      multipleLabel: workloadMultipleLabel(props.job.tags_workload),
      variant: "pg-workload",
    },
  ].filter(group => group.tags?.length > 0);

  return (
    <HStack gap={{ base: "gap.xs", md: "gap.md" }} flexWrap="wrap">
      {props.isOrgHighlighted && <Badge variant="pg-highlighted">Highlighted Org</Badge>}
      {tagGroups.map(tagGroup => {
        const tags = tagGroup.tags.filter(tag => !tagsHidden.includes(tag.name));
        if (tags.length === 0) {
          return null;
        }

        if (tagGroup.tags.length > 1) {
          return (
            <Badge
              key={tagGroup.attribute}
              variant={tagGroup.variant as never}
              {...ids.set(ids.job.card.tags)}
            >
              {tagGroup.multipleLabel}
            </Badge>
          );
        }

        const tag = tags[0];
        return (
          <Badge
            key={tagGroup.attribute}
            variant={tagGroup.variant as never}
            {...ids.set(ids.job.card.tags)}
          >
            {props.highlightable.includes(tagGroup.attribute) ? (
              <Highlight attribute={[tagGroup.attribute, "0", "name"]} hit={props.jobHit} />
            ) : (
              tag.name
            )}
          </Badge>
        );
      })}
    </HStack>
  );
}
