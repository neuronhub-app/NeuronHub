import {
  Badge,
  Box,
  Flex,
  Float,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Separator,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { FiExternalLink } from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import { LuGlobe } from "react-icons/lu";
import { PiClockClockwiseFill } from "react-icons/pi";
import { Highlight } from "react-instantsearch";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { datetime } from "@/utils/date-fns";
import { format } from "@/utils/format";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

const style = {
  header: {
    fontSize: "15px",
    lineHeight: "inherit",
  },
  label: {
    color: "fg",
    fontSize: "xs",
    fontWeight: "bold",
  },
  // #AI-slop, must be <Text {...style.data}/>
  color: {
    data: "fg",
  },
  fontSize: {
    location: "xs",
  },
  markHighlight: {
    "& mark": { bg: "yellow.200", color: "black", borderRadius: "2px", px: "1px" },
  },
} as const;

export function JobCard(props: { job: JobFragmentType; isSearchActive?: boolean }) {
  const isHighlightable = props.isSearchActive && "_highlightResult" in props.job;
  const jobHit = props.job as unknown as Hit<BaseHit>;

  return (
    <Stack
      as="article"
      gap="gap.sm2"
      p="gap.md"
      borderRadius="lg"
      borderColor="border.subtle"
      position="relative"
      bg="bg.panel"
      css={style.markHighlight}
      {...ids.set(ids.job.card.container)}
      data-id={props.job.id}
      {...getOutlineBleedingProps("muted")}
    >
      <HStack gap="gap.sm2">
        {props.job.org?.logo ? (
          <Image
            src={props.job.org.logo.url}
            w="20"
            h="20"
            borderRadius="md"
            objectFit="contain"
            {...getOutlineBleedingProps("muted")}
            bg="bg.subtle"
          />
        ) : (
          <Box
            w="20"
            h="20"
            borderRadius="md"
            {...getOutlineBleedingProps("muted")}
            bg="bg.subtle"
          />
        )}

        <VStack align="flex-start" gap="1" w="full">
          <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

          <Flex align="center" gap="gap.sm" fontSize={style.header.fontSize}>
            {props.job.org.is_highlighted && (
              <Badge
                variant="subtle"
                colorPalette="yellow"
                {...getOutlineBleedingProps("subtle")}
              >
                Highlighted
              </Badge>
            )}
            {isHighlightable ? (
              <Highlight attribute={["org", "name"]} hit={jobHit} />
            ) : (
              props.job.org.name
            )}
          </Flex>

          <HStack justify="space-between" align="center" w="full">
            <Flex gap="1" align="center" fontSize="sm">
              <Icon boxSize="17px" color="fg.subtle/80" ml="-1" mt="2px">
                <IoLocationSharp />
              </Icon>

              <Flex
                align="center"
                gap="gap.sm2"
                color="fg.muted"
                mt="2px"
                maxW="100%"
                pos="relative"
              >
                <JobLocations job={props.job} />

                {props.job.is_remote && (
                  <>
                    <Separator orientation="vertical" h="5" />
                    <Flex align="center" gap="gap.sm">
                      <Icon boxSize="4" color="fg.subtle/80">
                        <LuGlobe />
                      </Icon>
                      <Text fontSize={style.fontSize.location}>Remote</Text>
                    </Flex>
                  </>
                )}
              </Flex>
            </Flex>

            {props.job.salary_min && (
              <Flex fontSize={style.fontSize.location} mb="-1" color="fg.muted">
                {format.money(props.job.salary_min, { roundDown10k: true })}
                {"+"}
              </Flex>
            )}
          </HStack>
        </VStack>
      </HStack>

      <HStack justify="space-between" align="flex-end">
        <JobTagGroups
          job={props.job}
          highlightable={["tags_area"]}
          jobHit={jobHit}
          isHighlightable={isHighlightable}
        />

        <HStack align="flex-end" fontSize="xs" whiteSpace="nowrap" pos="relative" gap="gap.sm2">
          {props.job.closes_at && (
            <>
              <Tooltip
                content={
                  datetime.isFutureDate(props.job.closes_at)
                    ? `Closes ${datetime.full(props.job.closes_at)}`
                    : "Applications closed"
                }
                positioning={{ placement: "left" }}
              >
                <Flex gap="gap.sm" align="center" color="fg.subtle">
                  <Icon
                    boxSize="4"
                    color={datetime.isFutureDate(props.job.closes_at) ? "" : "fg.warning/80"}
                  >
                    <PiClockClockwiseFill />
                  </Icon>
                  {datetime.isFutureDate(props.job.closes_at) ? (
                    <Text>{datetime.relative(props.job.closes_at)}</Text>
                  ) : (
                    <Text color="fg.warning/80">Closed</Text>
                  )}
                </Flex>
              </Tooltip>
              <Separator orientation="vertical" h="4" />
            </>
          )}
          <Text color="fg.subtle">{datetime.relative(props.job.posted_at)}</Text>
        </HStack>
      </HStack>
    </Stack>
  );
}

function JobLocations(props: { job: JobFragmentType }) {
  const locations = [...(props.job.city ?? []), ...(props.job.country ?? [])]
    .filter(Boolean)
    .join("・");

  const isCropped = locations.length > 80;

  return (
    <Tooltip content={locations} disabled={!isCropped}>
      <Text
        maxW="md"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        fontSize={style.fontSize.location}
        overflow="hidden"
      >
        {locations}
      </Text>
    </Tooltip>
  );
}

function JobTitleLink(props: {
  job: JobFragmentType;
  isHighlightable?: boolean;
  jobHit: Hit<BaseHit>;
}) {
  const title = props.isHighlightable ? (
    <Highlight attribute="title" hit={props.jobHit} />
  ) : (
    props.job.title
  );

  return props.job.url_external ? (
    <Box className="group" cursor="pointer" pos="relative">
      <Link target="_blank" href={props.job.url_external} color="fg">
        <Heading {...style.header} fontWeight="bold">
          {title}
        </Heading>
      </Link>
      <Float placement="top-end" offsetX="-2" offsetY="1.5">
        <Icon
          boxSize="3.5"
          opacity="0"
          _groupHover={{ opacity: "1" }}
          transition="opacity .2s"
          color={{ _light: "colorPalette.600/88", _dark: "colorPalette.400" }}
        >
          <FiExternalLink />
        </Icon>
      </Float>
    </Box>
  ) : (
    <Heading {...style.header} fontWeight="semibold">
      {title}
    </Heading>
  );
}

function JobTagGroups(props: {
  job: JobFragmentType;
  highlightable: string[];
  jobHit: Hit<BaseHit>;
  isHighlightable?: boolean;
}) {
  const tagGroups = [
    {
      tags: props.job.tags_area,
      attribute: "tags_area",
      color: "green",
    },
    {
      tags: props.job.tags_experience,
      attribute: "tags_experience",
      color: "teal",
    },
    {
      tags: props.job.tags_education,
      attribute: "tags_education",
      color: "blue",
    },
    {
      tags: props.job.tags_workload,
      attribute: "tags_workload",
      color: "orange",
    },
  ].filter(group => group.tags?.length > 0);

  const tagsHidden = ["No education requirement", "Other", "Full-time"];

  return (
    <HStack gap="gap.sm2" flexWrap="wrap">
      {tagGroups.map(tagGroup => {
        const tags = tagGroup.tags.filter(tag => !tagsHidden.includes(tag.name));
        const isHasTags = tags.length > 0;

        return (
          isHasTags && (
            <Flex
              key={tagGroup.attribute}
              gap="gap.sm2"
              flexWrap="wrap"
              {...ids.set(ids.job.card.tags)}
            >
              {tags.map((tag, index) => (
                <Tag
                  display="flex"
                  key={tag.name}
                  variant="subtle"
                  colorPalette={tagGroup.color}
                >
                  {props.isHighlightable && props.highlightable.includes(tagGroup.attribute) ? (
                    <Highlight
                      attribute={[tagGroup.attribute, String(index), "name"]}
                      hit={props.jobHit}
                    />
                  ) : (
                    tag.name
                  )}
                </Tag>
              ))}
            </Flex>
          )
        );
      })}
    </HStack>
  );
}
