import {
  Badge,
  Box,
  Button,
  Flex,
  FormatNumber,
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
import { FiExternalLink } from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import { LuBuilding2, LuChevronDown } from "react-icons/lu";
import { Highlight } from "react-instantsearch";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { datetime } from "@/utils/date-fns";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { useStateValtio } from "@/utils/useStateValtio";

const style = {
  markHighlight: {
    "& mark": { bg: "yellow.200", color: "black", borderRadius: "2px", px: "1px" },
  },
} as const;

export function JobCard(props: { job: JobFragmentType; isSearchActive?: boolean }) {
  const isHighlightable = props.isSearchActive && "_highlightResult" in props.job;
  const jobHit = props.job as unknown as Hit<BaseHit>;
  const { mutable, snap } = useStateValtio({ isExpanded: false });

  return (
    <Stack
      as="article"
      pos="relative"
      gap={{ base: "gap.md", md: "gap.lg" }}
      p={{ base: "gap.md", md: "gap.xl" }}
      borderRadius="lg"
      bg="bg.card"
      fontFamily="body"
      css={style.markHighlight}
      {...ids.set(ids.job.card.container)}
      data-id={props.job.id}
      {...getOutlineBleedingProps("muted")}
    >
      <Stack gap="gap.sm">
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
              {...getOutlineBleedingProps("muted")}
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
              {...getOutlineBleedingProps("muted")}
            >
              <LuBuilding2 size={32} />
            </Flex>
          )}

          <Flex flex="1" minW="0" justify="space-between" gap="gap.md">
            <VStack align="flex-start" gap="gap.xs" minW="0">
              <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

              <Flex fontSize="md" fontWeight="medium" color="fg">
                {isHighlightable ? (
                  <Highlight attribute={["org", "name"]} hit={jobHit} />
                ) : (
                  props.job.org?.name
                )}
              </Flex>

              <Flex
                gap="1"
                align="center"
                fontSize="sm"
                overflow="hidden"
                w="full"
                display={{ base: "none", md: "flex" }}
              >
                <Icon boxSize="4" color="fg.muted">
                  <IoLocationSharp />
                </Icon>
                <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
                  <JobLocations job={props.job} />
                </Flex>
              </Flex>
            </VStack>

            <Flex
              display={{ base: "none", md: "flex" }}
              h="8"
              align="center"
              fontSize="sm"
              fontWeight="medium"
              color="fg.muted"
              whiteSpace="nowrap"
            >
              {datetime.relativeRounded(props.job.posted_at)}
            </Flex>
          </Flex>
        </Flex>

        <Flex align="center" gap="1" fontSize="sm" display={{ base: "flex", md: "none" }} pr="9">
          <Icon boxSize="4" color="fg.muted">
            <IoLocationSharp />
          </Icon>
          <Flex align="center" gap="gap.sm" color="fg.muted" fontWeight="medium" minW="0">
            <JobLocations job={props.job} />
          </Flex>
        </Flex>
      </Stack>

      <Box display={{ base: snap.isExpanded ? "block" : "none", md: "block" }}>
        <JobTagGroups
          job={props.job}
          highlightable={["tags_area"]}
          jobHit={jobHit}
          isOrgHighlighted={props.job.org?.is_highlighted}
        />
      </Box>
      {snap.isExpanded && props.job.description && <JobExpanded job={props.job} />}
      {props.job.description && (
        <Box
          pos="absolute"
          bottom={{ base: snap.isExpanded ? "8px" : "16px", md: "16px" }}
          right={{ base: snap.isExpanded ? "10px" : "16px", md: "24px" }}
          color="fg.muted"
          cursor="pointer"
          onClick={() => {
            mutable.isExpanded = !mutable.isExpanded;
          }}
        >
          <LuChevronDown
            size={24}
            style={{ transform: snap.isExpanded ? "rotate(180deg)" : undefined }}
          />
        </Box>
      )}
    </Stack>
  );
}

function JobExpanded(props: { job: JobFragmentType }) {
  return (
    <Stack gap={{ base: "gap.md", md: "gap.lg" }}>
      <Stack gap="gap.sm">
        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
          Job Description
        </Text>
        <Box as="ul" fontSize="sm" color="fg" pl="gap.md" listStyleType="disc">
          {props.job.description?.split("\n").map(line => (
            <li key={line}>{line}</li>
          ))}
        </Box>
      </Stack>
      <Flex gap="gap.md" flexDirection={{ base: "column", md: "row" }}>
          {props.job.salary_min && (
            <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
              <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                Salary
              </Text>
              <Text fontSize="sm">
                <FormatNumber
                  value={props.job.salary_min}
                  style="currency"
                  currency="USD"
                  notation="compact"
                  minimumFractionDigits={0}
                />
                +
              </Text>
            </Stack>
          )}
        <Stack gap={{ base: "gap.sm", md: "gap.xs" }} flex="1">
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            Application Deadline
          </Text>
          <Text fontSize="sm">
            {props.job.closes_at ? datetime.date(props.job.closes_at) : "Rolling applications"}
          </Text>
        </Stack>
      </Flex>
      {props.job.url_external && (
        <Button asChild colorPalette="green" w={{ base: "150px", md: "190px" }} h="10">
          <Link
            href={props.job.url_external}
            target="_blank"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            Job Details <FiExternalLink />
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
    <Text minW="0" textOverflow="ellipsis" whiteSpace="nowrap" fontSize="sm" overflow="hidden">
      {label}
    </Text>
  );
}

function JobTitleLink(props: {
  job: JobFragmentType;
  isHighlightable?: boolean;
  jobHit: Hit<BaseHit>;
}) {
  return (
    <Heading
      fontSize={{ base: "lg", md: "xl" }}
      fontWeight="semibold"
      fontFamily="heading"
      color="fg"
      lineHeight="1.6"
    >
      {props.isHighlightable ? (
        <Highlight attribute="title" hit={props.jobHit} />
      ) : (
        props.job.title
      )}
    </Heading>
  );
}

const tagStyle = {
  base: {
    h: "6",
    px: "gap.sm",
    borderRadius: "sm",
    fontSize: "sm",
    fontWeight: "normal",
    alignItems: "center",
  } as const,
  area: { bg: "green.subtle", fg: "green.fg" },
  experience: { bg: "teal.subtle", fg: "teal.fg" },
  education: { bg: "sky.subtle", fg: "sky.fg" },
  workload: { bg: "orange.subtle", fg: "orange.fg" },
  highlighted: { bg: "amber.subtle", fg: "amber.fg" },
  internship: { bg: "rose.subtle", fg: "rose.fg" },
} as const;

function JobTagGroups(props: {
  job: JobFragmentType;
  highlightable: string[];
  jobHit: Hit<BaseHit>;
  isOrgHighlighted?: boolean;
}) {
  const tagGroups = (
    [
      {
        tags: props.job.tags_area,
        attribute: "tags_area",
        multipleLabel: "Multiple Cause Areas",
        bg: tagStyle.area.bg,
        fg: tagStyle.area.fg,
      },
      {
        tags: props.job.tags_experience,
        attribute: "tags_experience",
        multipleLabel: "Multiple Experience Levels",
        bg: tagStyle.experience.bg,
        fg: tagStyle.experience.fg,
      },
      {
        tags: props.job.tags_education,
        attribute: "tags_education",
        multipleLabel: "Multiple Education Requirements",
        bg: tagStyle.education.bg,
        fg: tagStyle.education.fg,
      },
      {
        tags: props.job.tags_workload,
        attribute: "tags_workload",
        multipleLabel: "Multiple Role Types",
        bg: tagStyle.workload.bg,
        fg: tagStyle.workload.fg,
      },
    ] as const
  ).filter(group => group.tags?.length > 0);

  return (
    <HStack gap={{ base: "gap.xs", md: "gap.md" }} flexWrap="wrap">
      {props.isOrgHighlighted && (
        <Badge
          {...tagStyle.base}
          bg={tagStyle.highlighted.bg}
          color={tagStyle.highlighted.fg}
          {...getOutlineBleedingProps("subtle")}
        >
          Highlighted Org
        </Badge>
      )}
      {tagGroups.map(tagGroup => {
        const tagsHidden = ["No education requirement", "Other", "Full-time", "Undergrad"];
        const tags = tagGroup.tags.filter(tag => !tagsHidden.includes(tag.name));
        if (tags.length === 0) {
          return null;
        }

        if (tags.length > 1) {
          return (
            <Badge
              key={tagGroup.attribute}
              {...tagStyle.base}
              bg={tagGroup.bg}
              color={tagGroup.fg}
              {...getOutlineBleedingProps("subtle")}
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
            {...tagStyle.base}
            bg={tagGroup.bg}
            color={tagGroup.fg}
            {...getOutlineBleedingProps("subtle")}
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
