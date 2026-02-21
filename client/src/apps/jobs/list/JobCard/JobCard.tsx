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
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { BsBriefcase } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import { GoOrganization } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { LuGlobe } from "react-icons/lu";
import { MdUnfoldLess, MdUnfoldMore } from "react-icons/md";
import { Highlight } from "react-instantsearch";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { useStateValtio } from "@/utils/useValtioProxyRef";

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
  const state = useStateValtio({ isUnfolded: false });
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
    >
      {props.isSearchActive && (
        <Float placement="top-end" offsetX="6">
          <Button
            variant="outline"
            bg="bg.panel"
            color="fg"
            size="xs"
            colorPalette="gray"
            onClick={() => {
              state.mutable.isUnfolded = !state.snap.isUnfolded;
            }}
          >
            <Icon boxSize="3.5">
              {state.snap.isUnfolded ? <MdUnfoldLess /> : <MdUnfoldMore />}
            </Icon>
            {state.snap.isUnfolded ? "Fold" : "Unfold"}
          </Button>
        </Float>
      )}

      <Stack gap="gap.sm2">
        <HStack gap="gap.md" align="flex-start">
          <JobTitleLink job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />
        </HStack>

        <Flex gap="gap.sm2" flexWrap="wrap">
          {props.job.org && (
            <Flex
              color={style.color.data}
              fontSize={style.fontSize.data}
              align="center"
              gap="gap.sm"
            >
              <Icon boxSize="4.5" color="fg.muted/65">
                <GoOrganization />
              </Icon>
              {isHighlightable ? <Highlight attribute="org" hit={jobHit} /> : props.job.org}
            </Flex>
          )}

          {props.job.org && location && <Separator orientation="vertical" h="5" />}

          {location && (
            <Flex align="center" gap="1">
              <Icon boxSize="19px" color="fg.muted" ml="-1">
                <IoLocationOutline />
              </Icon>
              <Text fontSize={style.fontSize.data}>{location}</Text>
            </Flex>
          )}

          {props.job.is_remote && (
            <>
              <Separator orientation="vertical" h="5" />
              <Flex align="center" gap="1">
                <Icon boxSize="4" color="fg.muted/65">
                  <LuGlobe />
                </Icon>
                <Text fontSize={style.fontSize.data}>Remote</Text>
              </Flex>
            </>
          )}
        </Flex>

        <Flex gap="gap.sm2" flexWrap="wrap">
          {props.job.salary_min != null && (
            <Flex align="center" gap="1">
              <Icon boxSize="4" color="fg.muted/65">
                <BsBriefcase />
              </Icon>
              <Text color={style.color.data} fontSize={style.fontSize.data}>
                ${props.job.salary_min.toLocaleString()}+
              </Text>
            </Flex>
          )}

          {props.job.is_visa_sponsor && (
            <Tag variant="subtle" colorPalette="green" size="sm">
              Visa Sponsor
            </Tag>
          )}

          {props.job.is_remote_friendly && !props.job.is_remote && (
            <Tag variant="subtle" colorPalette="blue" size="sm">
              Remote Friendly
            </Tag>
          )}
        </Flex>
      </Stack>

      <JobTagGroups job={props.job} isHighlightable={isHighlightable} jobHit={jobHit} />
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
      <Link
        target="_blank"
        fontWeight="semibold"
        href={props.job.url_external}
        color={{ _light: "colorPalette.600/88", _dark: "colorPalette.400" }}
      >
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
  isHighlightable?: boolean;
  jobHit: Hit<BaseHit>;
}) {
  const tagGroups = [
    { label: "Area", tags: props.job.tags_area, attribute: "tags_area" },
    { label: "Skills", tags: props.job.tags_skill, attribute: "tags_skill" },
    { label: "Workload", tags: props.job.tags_workload, attribute: "tags_workload" },
    { label: "Experience", tags: props.job.tags_experience, attribute: "tags_experience" },
    { label: "Education", tags: props.job.tags_education, attribute: "tags_education" },
  ].filter(g => g.tags?.length > 0);

  if (tagGroups.length === 0) return null;

  return (
    <HStack align="flex-start" flexWrap="wrap" gap="gap.md">
      {tagGroups.map(group => (
        <Stack key={group.label} gap="gap.sm" flex="1" minW="120px">
          <Text {...style.label}>{group.label}</Text>
          <Flex gap="gap.sm" flexWrap="wrap" {...ids.set(ids.job.card.tags)}>
            {group.tags.map((tag, index) => (
              <Tag key={tag.name} variant="subtle" colorPalette="gray">
                {props.isHighlightable ? (
                  <Highlight
                    attribute={[group.attribute, String(index), "name"]}
                    hit={props.jobHit}
                  />
                ) : (
                  tag.name
                )}
              </Tag>
            ))}
          </Flex>
        </Stack>
      ))}
    </HStack>
  );
}
