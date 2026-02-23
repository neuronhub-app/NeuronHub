import {
  Box,
  Flex,
  Float,
  Heading,
  HStack,
  Icon,
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
import { Highlight } from "react-instantsearch";
import { Tag } from "@/components/ui/tag";
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

  const location = [...(props.job.city ?? []), ...(props.job.country ?? [])]
    .filter(Boolean)
    .join(", ");

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
        <Box
          w="24"
          h="24"
          borderRadius="md"
          {...getOutlineBleedingProps("muted")}
          bg="bg.subtle"
        />

        <VStack align="flex-start" gap="gap.sm">
          <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />

          <Flex>
            {isHighlightable ? <Highlight attribute="org" hit={jobHit} /> : props.job.org}
          </Flex>

          <Flex align="center" gap="gap.sm2" color="fg.muted" mt="2px">
            <Flex gap="gap.xs">
              <Icon boxSize="17px" color="fg.subtle/80" ml="-1" mt="2px">
                <IoLocationSharp />
              </Icon>
              <Text fontSize={style.fontSize.data}>{location}</Text>
            </Flex>

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
        </VStack>
      </HStack>

      <HStack justify="space-between">
        <JobTagGroups job={props.job} highlightable={["tags_area"]} jobHit={jobHit} />

        <Text color="fg.subtle" fontSize={style.fontSize.data}>
          {datetime.relative(props.job.posted_at)}
        </Text>
      </HStack>
    </Stack>
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

  return (
    <HStack gap="gap.md">
      {tagGroups.map(tagGroup => (
        <Flex key={tagGroup.attribute} gap="gap.sm">
          <Flex gap="gap.sm" flexWrap="wrap" {...ids.set(ids.job.card.tags)}>
            {tagGroup.tags.map((tag, index) => (
              <Tag
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
      ))}
    </HStack>
  );
}
