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
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

const style = {
  header: {
    fontSize: "md",
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
    data: "sm",
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
            w="24"
            h="24"
            borderRadius="md"
            objectFit="contain"
            {...getOutlineBleedingProps("muted")}
            bg="bg.subtle"
          />
        ) : (
          <Box
            w="24"
            h="24"
            borderRadius="md"
            {...getOutlineBleedingProps("muted")}
            bg="bg.subtle"
          />
        )}

        <VStack align="flex-start" gap="gap.sm">
          <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

          <Flex align="center" gap="gap.sm">
            {props.job.org?.is_highlighted && (
              <Badge variant="subtle" colorPalette="yellow">
                Highlighted
              </Badge>
            )}
            {isHighlightable ? (
              <Highlight attribute={["org", "name"]} hit={jobHit} />
            ) : (
              props.job.org?.name
            )}
          </Flex>

          <Flex gap="gap.xs" align="center">
            <Icon boxSize="17px" color="fg.subtle/80" ml="-1" mt="2px">
              <IoLocationSharp />
            </Icon>

            <Flex align="center" gap="gap.sm2" color="fg.muted" mt="2px">
              <JobLocations job={props.job} />

              {props.job.is_remote && (
                <>
                  <Separator orientation="vertical" h="5" />
                  <Flex align="center" gap="1">
                    <Icon boxSize="4" color="fg.subtle/80">
                      <LuGlobe />
                    </Icon>
                    <Text fontSize={style.fontSize.data}>Remote</Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </VStack>
      </HStack>

      <HStack justify="space-between" align="flex-end">
        <JobTagGroups job={props.job} highlightable={["tags_area"]} jobHit={jobHit} />

        <VStack align="flex-end" fontSize="xs" whiteSpace="nowrap" pos="relative">
          {props.job.closes_at && (
            <Tooltip
              content={
                datetime.isFutureDate(props.job.closes_at)
                  ? `Closes ${datetime.full(props.job.closes_at)}`
                  : "Applications closed"
              }
              positioning={{ placement: "left" }}
            >
              <Flex
                gap="gap.sm"
                align="center"
                color="fg.subtle"
                pos="absolute"
                transform="translateY(-120%)"
              >
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
          )}
          <Text color="fg.subtle">{datetime.relative(props.job.posted_at)}</Text>
        </VStack>
      </HStack>
    </Stack>
  );
}

function JobLocations(props: { job: JobFragmentType }) {
  const locations = [...(props.job.city ?? []), ...(props.job.country ?? [])].filter(Boolean);

  const abbreviations = [
    { input: "United States (USA)", output: "US" },
    { input: "United Kingdom (UK)", output: "UK" },
    { input: "Washington D.C.", output: "Washington DC" },
    { input: "London UK", output: "London" },
    { input: "San Francisco CA", output: "SF" },
    { input: "New York NY", output: "NY" },
    { input: "Berkeley CA", output: "Berkeley" },
    { input: "New Delhi IN", output: "New Delhi" },
  ];

  return (
    <HStack gap="0">
      {locations
        .map(location => {
          for (const abbr of abbreviations) {
            if (location === abbr.input) {
              return location.replace(abbr.input, abbr.output);
            }
          }
          return location;
        })
        .map((location, index) => {
          const isHasSeparator = index !== 0;

          return (
            <>
              {isHasSeparator && (
                <Separator
                  key={`${location}-sep`}
                  border="0"
                  orientation="horizontal"
                  color="fg.subtle"
                >
                  ・
                </Separator>
              )}
              <Text key={location} fontSize={style.fontSize.data}>
                {location}
              </Text>
            </>
          );
        })}
    </HStack>
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
      <Link target="_blank" fontWeight="semibold" href={props.job.url_external} color="fg">
        <Heading {...style.header} fontWeight="semibold">
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

  const tagsAbbreviations = [
    { input: "+ years experience", output: "y+" },
    { input: " years experience", output: "y" },
    { input: "Undergraduate", output: "Undergrad" },
  ];

  return (
    <HStack gap="gap.sm2" flexWrap="wrap">
      {tagGroups.map(tagGroup => {
        let tags = tagGroup.tags.filter(tag => !tagsHidden.includes(tag.name));

        tags = tags.map(tag => {
          const tagNew = { ...tag };
          for (const abbr of tagsAbbreviations) {
            tagNew.name = tagNew.name.replace(abbr.input, abbr.output);
          }
          return tagNew;
        });

        const isHasTags = tags.length > 0;

        return (
          isHasTags && (
            <Flex key={tagGroup.attribute} gap="gap.sm">
              <Flex gap="gap.sm" flexWrap="wrap" {...ids.set(ids.job.card.tags)}>
                {tags.map((tag, index) => (
                  <Tag
                    display="flex"
                    key={tag.name}
                    variant="subtle"
                    colorPalette={tagGroup.color}
                    {...getOutlineBleedingProps("subtle")}
                  >
                    {props.highlightable.includes(tagGroup.attribute) ? (
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
            </Flex>
          )
        );
      })}
    </HStack>
  );
}
