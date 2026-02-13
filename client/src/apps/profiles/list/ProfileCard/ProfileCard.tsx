import {
  Badge,
  Box,
  Center,
  Collapsible,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { BsBriefcase } from "react-icons/bs";
import { FaIdCardClip, FaLinkedinIn, FaLocationDot } from "react-icons/fa6";
import { GoOrganization } from "react-icons/go";
import { LuChevronDown } from "react-icons/lu";

import { Highlight, Snippet } from "react-instantsearch";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { Tag } from "@/components/ui/tag";
import { ids } from "@/e2e/ids";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";
import { markedConfigured } from "@/utils/marked-configured";
import { useStateValtio } from "@/utils/useValtioProxyRef";

// #AI
export function ProfileCard(props: {
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  isEnrichedByGraphql: boolean;
}) {
  const profileHit = props.profile as unknown as Hit<BaseHit>;

  const matchScore = props.profile.match?.match_score ?? props.profile.match?.match_score_by_llm; // wrong
  const isHighlightable = props.isSearchActive && "_highlightResult" in props.profile;

  return (
    <Stack
      as="article"
      gap="gap.sm2"
      bg="bg.light"
      p="gap.md"
      borderRadius="lg"
      border="1px solid"
      borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
      {...ids.set(ids.profile.card.container)}
    >
      <HStack justify="space-between" align="flex-start">
        <Stack gap="gap.sm">
          <HStack gap="gap.md" align="center">
            <Heading fontSize="md" fontWeight="medium">
              {isHighlightable ? (
                <>
                  <Highlight attribute="first_name" hit={profileHit} />{" "}
                  <Highlight attribute="last_name" hit={profileHit} />
                </>
              ) : (
                `${props.profile.first_name} ${props.profile.last_name}`
              )}
            </Heading>
            <Separator orientation="vertical" h="5" />
            <Text color={style.color.data} fontSize="md">
              {props.profile.job_title}
            </Text>
            <Separator orientation="vertical" h="5" />
            {(props.profile.url_linkedin || props.profile.url_conference) && (
              <HStack gap="gap.sm2" align="center">
                {props.profile.url_linkedin && (
                  <Link href={`https://${props.profile.url_linkedin}`} target="_blank">
                    <Icon
                      boxSize="21px"
                      w="25px"
                      color="fg.inverted"
                      bg="fg.subtle/80"
                      borderRadius="sm"
                      p="1"
                      px="1.5"
                      _hover={{ bg: "blue.500" }}
                    >
                      <FaLinkedinIn />
                    </Icon>
                  </Link>
                )}
                {props.profile.url_conference && (
                  <Link href={`https://${props.profile.url_conference}`} target="_blank">
                    <Icon
                      boxSize="24px"
                      color="fg.subtle/80"
                      mt="-2px"
                      _hover={{ color: "blue.500" }}
                    >
                      <FaIdCardClip />
                    </Icon>
                  </Link>
                )}
              </HStack>
            )}
          </HStack>

          <Flex gap="gap.sm2">
            {props.profile.company && (
              <Flex
                color={style.color.data}
                fontSize={style.fontSize.data}
                align="center"
                gap="gap.sm"
              >
                <Icon boxSize="4.5" color="fg.muted/75">
                  <GoOrganization />
                </Icon>
                {props.profile.company}
              </Flex>
            )}
            <Separator orientation="vertical" h="5" />

            {props.profile.country && (
              <Flex align="center" gap="1">
                <Icon boxSize="3.5" color="fg.subtle/50">
                  <FaLocationDot />
                </Icon>
                <Text color={style.color.help} fontSize={style.fontSize.help}>
                  {[props.profile.city, props.profile.country].filter(Boolean).join(", ")}
                </Text>
              </Flex>
            )}
          </Flex>

          {props.profile.career_stage.length > 0 && (
            <Flex align="center" gap="1.5">
              <Icon boxSize="4" color="fg.muted/75">
                <BsBriefcase />
              </Icon>
              <Text color={style.color.data} fontSize={style.fontSize.data}>
                {props.profile.career_stage.join(", ")}
              </Text>
            </Flex>
          )}
        </Stack>

        <Flex>
          <HStack gap="gap.sm">
            {!props.isEnrichedByGraphql && <Spinner size="xs" color="fg.subtle" />}

            {/* wrong */}
            {matchScore != null && (
              <Badge
                colorPalette={matchScore >= 70 ? "green" : matchScore >= 40 ? "yellow" : "gray"}
                variant="subtle"
                fontSize="xs"
              >
                {matchScore}
              </Badge>
            )}
          </HStack>
        </Flex>
      </HStack>

      <ProfileContentSection
        label="Bio"
        text={props.profile.biography}
        snippetAttribute="biography"
        profile={props.profile}
        isSearchActive={props.isSearchActive}
        collapsedHeight={style.collapseHeight.bio}
      />

      {(props.profile.skills?.length > 0 || props.profile.interests?.length > 0) && (
        <HStack align="flex-start" flexWrap="wrap">
          {props.profile.skills?.length > 0 && (
            <ProfileTagGroup label="Skills" tags={props.profile.skills} colorPalette="gray" />
          )}

          {props.profile.interests?.length > 0 && (
            <ProfileTagGroup
              label="Interests"
              tags={props.profile.interests}
              colorPalette="gray"
            />
          )}
        </HStack>
      )}

      <SeeksOffersSection profile={props.profile} isSearchActive={props.isSearchActive} />
    </Stack>
  );
}

// #AI
function ProfileTagGroup(props: {
  label: string;
  tags: { id: string; name: string }[];
  colorPalette: string;
}) {
  return (
    <Stack gap="gap.sm" flex="1">
      <Text {...style.label}>{props.label}</Text>
      <Flex gap="gap.sm" flexWrap="wrap" {...ids.set(ids.profile.card.tags)}>
        {props.tags.map(tag => {
          return (
            <Tag key={tag.name} variant="subtle" size="md" colorPalette={props.colorPalette}>
              {tag.name}
            </Tag>
          );
        })}
      </Flex>
    </Stack>
  );
}

// #AI
function ProfileContentSection(props: {
  label: string;
  text?: string | null;
  snippetAttribute: string;
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  collapsedHeight?: string;
  flex?: string;
  minW?: string;
}) {
  if (!props.text) {
    return null;
  }

  const isSearchSnippet = props.isSearchActive && "_snippetResult" in props.profile;

  const content = isSearchSnippet ? (
    <Text
      color="fg"
      fontSize="sm"
      css={{
        "& mark": { bg: "yellow.200", color: "black", borderRadius: "2px", px: "1px" },
      }}
      {...ids.set(ids.profile.card.contentSnippet)}
    >
      <Snippet
        attribute={props.snippetAttribute}
        hit={props.profile as unknown as Hit<BaseHit>}
      />
    </Text>
  ) : (
    <Prose
      // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
      dangerouslySetInnerHTML={{ __html: markedConfigured.parse(props.text) }}
      size="sm"
      maxW="3xl"
      color="fg"
      {...ids.set(ids.profile.card.contentMarkdown)}
    />
  );

  return (
    <Stack gap="gap.xs" flex={props.flex} minW={props.minW}>
      <Text {...style.label}>{props.label}</Text>
      {props.collapsedHeight ? (
        <CollapsibleSection
          collapsedHeight={props.collapsedHeight}
          isSearchActive={props.isSearchActive}
        >
          {content}
        </CollapsibleSection>
      ) : (
        content
      )}
    </Stack>
  );
}

function SeeksOffersSection(props: { profile: ProfileFragmentType; isSearchActive?: boolean }) {
  if (!props.profile.seeks && !props.profile.offers) {
    return null;
  }

  return (
    <CollapsibleSection
      collapsedHeight={style.collapseHeight.seeksAndOffers}
      isSearchActive={props.isSearchActive}
    >
      <HStack align="flex-start" flexWrap="wrap">
        <ProfileContentSection
          label="Seeks"
          text={props.profile.seeks}
          snippetAttribute="seeks"
          profile={props.profile}
          isSearchActive={props.isSearchActive}
          flex="1"
        />
        <ProfileContentSection
          label="Offers"
          text={props.profile.offers}
          snippetAttribute="offers"
          profile={props.profile}
          isSearchActive={props.isSearchActive}
          flex="1"
        />
      </HStack>
    </CollapsibleSection>
  );
}

// #AI
function CollapsibleSection(props: {
  children: ReactNode;
  collapsedHeight: string;
  isSearchActive?: boolean;
}) {
  const state = useStateValtio({ isOpen: false, isOverflowing: false });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }
    const heightMax = Number.parseInt(props.collapsedHeight, 10);
    state.mutable.isOverflowing = contentRef.current.scrollHeight > heightMax;
  });

  if (!state.snap.isOverflowing) {
    return <Box ref={contentRef}>{props.children}</Box>;
  }

  return (
    <Collapsible.Root
      collapsedHeight={props.collapsedHeight}
      open={props.isSearchActive || state.snap.isOpen}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
      }}
    >
      <Collapsible.Content _closed={style.collapsibleShadow}>
        <Box ref={contentRef}>{props.children}</Box>
      </Collapsible.Content>

      {!props.isSearchActive && (
        <Center>
          <Collapsible.Trigger asChild>
            <Button
              variant="subtle"
              size="xs"
              colorPalette="gray"
              {...ids.set(ids.profile.card.contentCollapsibleTrigger)}
            >
              {state.snap.isOpen ? "Show less" : "Show more"}
              <Collapsible.Indicator
                transition="transform 0.2s"
                _open={{ transform: "rotate(180deg)" }}
              >
                <LuChevronDown />
              </Collapsible.Indicator>
            </Button>
          </Collapsible.Trigger>
        </Center>
      )}
    </Collapsible.Root>
  );
}

// #AI
const style = {
  label: {
    color: "fg",
    fontSize: "xs",
    fontWeight: "bold",
  },
  color: {
    data: "fg.muted",
    help: "fg.muted",
  },
  fontSize: {
    data: "sm",
    help: "sm",
  },
  collapseHeight: {
    bio: "110px",
    seeksAndOffers: "140px",
  },
  collapsibleShadow: {
    shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
    shadowColor: { _light: "blackAlpha.500", _dark: "whiteAlpha.300" },
  },
} as const;
