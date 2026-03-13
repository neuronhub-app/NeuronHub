import {
  Badge,
  Box,
  Button,
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
import type { BaseHit, Hit } from "instantsearch.js";
import { IoLocationSharp } from "react-icons/io5";
import { LuBuilding2, LuChevronDown, LuExternalLink } from "react-icons/lu";
import { Highlight, Snippet, useInstantSearch } from "react-instantsearch";
import { Prose } from "@/components/ui/prose";
import { Tooltip } from "@/components/ui/tooltip";
import { markedConfigured } from "@/utils/marked-configured";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { datetime } from "@/utils/date-fns";
import { useStateValtio } from "@/utils/useStateValtio";

const style = {
  markHighlight: {
    "& mark": { bg: "yellow.200", color: "black", borderRadius: "2px", px: "1px" },
  },
  tag: {
    base: {
      h: "6",
      px: "gap.sm",
      borderRadius: "sm",
      fontSize: "sm",
      fontWeight: "normal",
      alignItems: "center",
    } as const,
    highlighted: { bg: "#FCEFAC", fg: "#7A6A1E" },
    area: { bg: "#DBEADD", fg: "#1F6B29" },
    experience: { bg: "#E1EFEE", fg: "#1A6860" },
    education: { bg: "#E1F3F9", fg: "#2C5E6E" },
    workload: { bg: "#F0EBEC", fg: "#7D4D57" },
  },
} as const;

type TagGroup = {
  tags: { name: string }[];
  attribute: string;
  multipleLabel: string;
  multipleLabelOverride?: (tags: { name: string }[]) => string | undefined;
  bg: string;
  fg: string;
};

const tagsHidden = ["No education requirement", "Other", "Full-time", "Undergrad"];

function hasDescriptionMatch(jobHit: Hit<BaseHit>): boolean {
  // @ts-expect-error #bad-infer Algolia _highlightResult is untyped
  const matchLevel = jobHit._highlightResult?.description?.matchLevel;
  return matchLevel === "full" || matchLevel === "partial";
}

export function JobCard(props: { job: JobFragmentType; isSearchActive?: boolean }) {
  const { results } = useInstantSearch();

  const { mutable, snap } = useStateValtio({ isExpanded: false });

  const isHighlightable = !!props.isSearchActive && "_highlightResult" in props.job;
  const jobHit = props.job as unknown as Hit<BaseHit>;
  const hasDescriptionHit = isHighlightable && !!results.query && hasDescriptionMatch(jobHit);

  return (
    <Stack
      as="article"
      pos="relative"
      gap="0"
      p={{ base: "gap.md", md: "gap.xl" }}
      pr={{ md: "16" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={snap.isExpanded ? "brand.black" : "subtle"}
      bg="bg.card"
      fontFamily="body"
      css={style.markHighlight}
      {...ids.set(ids.job.card.container)}
      data-id={props.job.id}
    >
      <Stack gap="gap.sm" mb={{ base: snap.isExpanded ? "gap.md" : "0", md: "gap.lg" }}>
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
              bg="subtle"
              align="center"
              justify="center"
              color="fg.muted"
            >
              <LuBuilding2 size={32} />
            </Flex>
          )}

          <Flex flex="1" minW="0" justify="space-between" gap="gap.md">
            <VStack
              align="flex-start"
              justify={{ md: "space-between" }}
              gap={{ base: "3px", md: "0" }}
            >
              <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

              <JobOrgLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

              <Flex
                display={{ base: "none", md: "flex" }}
                gap="1"
                align="center"
                overflow="hidden"
                w="full"
                fontSize={{ base: "13px", md: "sm" }}
                lineHeight={{ base: "18px", md: "20px" }}
              >
                <Icon boxSize="4" color="fg.muted">
                  <IoLocationSharp />
                </Icon>
                <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
                  <JobLocations job={props.job} />
                </Flex>
              </Flex>
            </VStack>
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
          <Icon boxSize="4" color="fg.muted">
            <IoLocationSharp />
          </Icon>
          <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
            <JobLocations job={props.job} />
          </Flex>
        </Flex>
      </Stack>

      <Box
        display={{ base: snap.isExpanded ? "block" : "none", md: "block" }}
        mb={{
          base: snap.isExpanded ? "gap.md" : "0",
          md: snap.isExpanded || hasDescriptionHit ? "gap.lg" : "0",
        }}
      >
        <JobTagGroups
          job={props.job}
          highlightable={["tags_area"]}
          jobHit={jobHit}
          isOrgHighlighted={props.job.org?.is_highlighted}
        />
      </Box>
      {hasDescriptionHit && !snap.isExpanded && (
        <Stack gap="gap.sm" mb={{ base: "gap.md", md: "gap.lg" }}>
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Job Description
          </Text>
          <Box fontSize="sm" color="fg">
            <Snippet attribute="description" hit={jobHit} />
          </Box>
        </Stack>
      )}
      <Collapsible.Root open={snap.isExpanded}>
        <Collapsible.Content animationDuration="slow">
          {props.job.description && <JobExpanded job={props.job} />}
        </Collapsible.Content>
      </Collapsible.Root>
      {props.job.description && (
        <Box
          pos="absolute"
          top="0"
          right="0"
          bottom="0"
          w={{ base: "12", md: "16" }}
          borderRadius="lg"
          onClick={() => {
            mutable.isExpanded = !mutable.isExpanded;
          }}
          cursor="pointer"
          userSelect="none"
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            borderTopRightRadius: "lg",
            borderBottomRightRadius: "lg",
            background:
              "linear-gradient(to top left, rgba(200,200,200,0.3) 0%, transparent 80%)",
            opacity: 0,
            transition: "opacity 0.2s ease-out",
            pointerEvents: "none",
          }}
          _hover={{ _before: { opacity: 1 } }}
        >
          <Tooltip
            content={datetime.full(props.job.posted_at)}
            positioning={{ placement: "left" }}
          >
            <Flex
              pos="absolute"
              top={{ base: "gap.md", md: "gap.xl" }}
              right={{ base: "gap.sm", md: "gap.lg" }}
              display={{ base: "none", md: "flex" }}
              h="8"
              align="center"
              fontSize="sm"
              fontWeight="medium"
              color="fg.muted"
              whiteSpace="nowrap"
            >
              {datetime.relativeFull(props.job.posted_at)}
            </Flex>
          </Tooltip>
          <Flex
            pos="absolute"
            bottom={{ base: "8px", md: "gap.md" }}
            right={{ base: "gap.sm", md: "gap.lg" }}
            color="fg.muted"
          >
            <LuChevronDown
              size={24}
              style={{
                transform: snap.isExpanded ? "rotate(180deg)" : undefined,
                transition: "transform 0.25s ease",
              }}
            />
          </Flex>
        </Box>
      )}
    </Stack>
  );
}

function JobExpanded(props: { job: JobFragmentType }) {
  return (
    <Stack gap={{ base: "gap.md", md: "gap.lg" }}>
      <Stack gap="0">
        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
          Job Description
        </Text>
        <Prose
          size="sm"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
          dangerouslySetInnerHTML={{
            __html: markedConfigured.parse(props.job.description ?? ""),
          }}
        />
      </Stack>
      <Flex gap="gap.md" flexDirection={{ base: "column", md: "row" }}>
        <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Application Deadline
          </Text>
          <Text fontSize="sm">
            {props.job.closes_at ? datetime.date(props.job.closes_at) : "Rolling applications"}
          </Text>
        </Stack>
        {props.job.salary_text && (
          <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
            <Text fontSize="sm" color="fg.muted" fontWeight="medium">
              Salary
            </Text>
            <Text fontSize="sm">{props.job.salary_text}</Text>
          </Stack>
        )}
      </Flex>
      {props.job.url_external && (
        <Button
          asChild
          variant={"pg-primary" as "solid"}
          w={{ base: "150px", md: "190px" }}
          h="10"
        >
          <Link
            href={props.job.url_external}
            target="_blank"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            Job Details
            <Icon boxSize="4" position="relative" top="-1px">
              <LuExternalLink />
            </Icon>
          </Link>
        </Button>
      )}
    </Stack>
  );
}

function JobLocations(props: { job: JobFragmentType }) {
  const locationNames = [...(props.job.tags_city ?? []), ...(props.job.tags_country ?? [])]
    .map(tag => tag.name)
    .filter(Boolean);

  const label = locationNames.length >= 4 ? "Multiple Locations" : locationNames.join("・");

  return (
    <Text overflow="hidden" minW="0" fontSize="sm" textOverflow="ellipsis" whiteSpace="nowrap">
      {label}
    </Text>
  );
}

function JobOrgLink(props: {
  job: JobFragmentType;
  isHighlightable: boolean;
  jobHit: Hit<BaseHit>;
}) {
  const orgName = props.isHighlightable ? (
    <Highlight attribute={["org", "name"]} hit={props.jobHit} />
  ) : (
    props.job.org?.name
  );

  return props.job.org?.website ? (
    <Flex align="center" gap="gap.xs" className="group">
      <Link
        href={props.job.org.website}
        target="_blank"
        fontSize={{ base: "13px", md: "md" }}
        lineHeight={{ base: "18px", md: "24px" }}
        fontWeight="medium"
        color="fg"
        textDecoration="none"
        _hover={{ textDecoration: "underline", textDecorationColor: "subtle" }}
        focusRingColor="transparent"
      >
        {orgName}
      </Link>
      <Icon
        boxSize="4"
        position="relative"
        top="-1px"
        opacity="0"
        color="fg.muted"
        transition="opacity .15s"
        _groupHover={{ opacity: "1" }}
      >
        <LuExternalLink />
      </Icon>
    </Flex>
  ) : (
    <Flex
      fontSize={{ base: "13px", md: "md" }}
      lineHeight={{ base: "18px", md: "24px" }}
      fontWeight="medium"
      color="fg"
    >
      {orgName}
    </Flex>
  );
}

function JobTitleLink(props: {
  job: JobFragmentType;
  isHighlightable?: boolean;
  jobHit: Hit<BaseHit>;
}) {
  return (
    <Heading
      fontSize={{ base: "17px", md: "xl" }}
      lineHeight={{ base: "21px", md: "28px" }}
      fontWeight="semibold"
      fontFamily="heading"
      color="fg"
    >
      {props.isHighlightable ? (
        <Highlight attribute="title" hit={props.jobHit} />
      ) : (
        props.job.title
      )}
    </Heading>
  );
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
      bg: style.tag.area.bg,
      fg: style.tag.area.fg,
    },
    {
      tags: props.job.tags_experience,
      attribute: "tags_experience",
      multipleLabel: "Multiple Experience Levels",
      bg: style.tag.experience.bg,
      fg: style.tag.experience.fg,
    },
    {
      tags: props.job.tags_education,
      attribute: "tags_education",
      multipleLabel: "Multiple Education Requirements",
      bg: style.tag.education.bg,
      fg: style.tag.education.fg,
    },
    {
      tags: props.job.tags_workload,
      attribute: "tags_workload",
      multipleLabel: "Multiple Role Types",
      multipleLabelOverride: (tags: { name: string }[]) =>
        tags.some(tag => tag.name === "Full-time") && tags.some(tag => tag.name === "Part-time")
          ? "Full-Time or Part-Time"
          : undefined,
      bg: style.tag.workload.bg,
      fg: style.tag.workload.fg,
    },
  ].filter(group => group.tags?.length > 0);

  return (
    <HStack gap={{ base: "gap.xs", md: "gap.md" }} flexWrap="wrap">
      {props.isOrgHighlighted && (
        <Badge
          {...style.tag.base}
          bg={style.tag.highlighted.bg}
          color={style.tag.highlighted.fg}
        >
          Highlighted Org
        </Badge>
      )}
      {tagGroups.map(tagGroup => {
        const tags = tagGroup.tags.filter(tag => !tagsHidden.includes(tag.name));
        if (tags.length === 0) {
          return null;
        }

        const overrideLabel = tagGroup.multipleLabelOverride?.(tagGroup.tags);
        if (tags.length > 1 || overrideLabel) {
          const label = overrideLabel ?? tagGroup.multipleLabel;
          return (
            <Badge
              key={tagGroup.attribute}
              {...style.tag.base}
              bg={tagGroup.bg}
              color={tagGroup.fg}
              {...ids.set(ids.job.card.tags)}
            >
              {label}
            </Badge>
          );
        }

        const tag = tags[0];
        return (
          <Badge
            key={tagGroup.attribute}
            {...style.tag.base}
            bg={tagGroup.bg}
            color={tagGroup.fg}
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
