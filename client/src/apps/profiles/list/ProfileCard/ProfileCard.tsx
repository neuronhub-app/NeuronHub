import {
  Box,
  Center,
  Collapsible,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  RatingGroup,
  Separator,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { BsBriefcase } from "react-icons/bs";
import { FaLinkedin, FaLocationDot } from "react-icons/fa6";
import { GoOrganization } from "react-icons/go";
import { LuCheck, LuChevronDown, LuRefreshCw } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import { Highlight, Snippet } from "react-instantsearch";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { markedConfigured } from "@/utils/marked-configured";
import { useStateValtio } from "@/utils/useValtioProxyRef";

// #AI
export function ProfileCard(props: {
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  isEnrichedByGraphql: boolean;
}) {
  const profileHit = props.profile as unknown as Hit<BaseHit>;
  const isHighlightable = props.isSearchActive && "_highlightResult" in props.profile;

  return (
    <Stack
      as="article"
      gap="gap.sm2"
      p="gap.md"
      borderRadius="lg"
      border="1px solid"
      borderColor="border.muted"
      {...ids.set(ids.profile.card.container)}
    >
      <HStack justify="space-between" align="flex-start">
        <Stack gap="gap.sm">
          <HStack gap="gap.md" align="center">
            <Link
              target="_blank"
              href={`https://${props.profile.url_conference}`}
              color={{ _light: "teal.700", _dark: "teal.400" }}
            >
              <Heading fontSize="md" fontWeight="semibol">
                {isHighlightable ? (
                  <>
                    <Highlight attribute="first_name" hit={profileHit} />{" "}
                    <Highlight attribute="last_name" hit={profileHit} />
                  </>
                ) : (
                  `${props.profile.first_name} ${props.profile.last_name}`
                )}
              </Heading>
            </Link>
            <Separator orientation="vertical" h="5" />
            <Text color="fg.dark-friendly" fontSize="md">
              {props.profile.job_title}
            </Text>
            {(props.profile.url_linkedin || props.profile.url_conference) && (
              <HStack gap="gap.sm2" align="center">
                {props.profile.url_linkedin && (
                  <Link href={`https://${props.profile.url_linkedin}`} target="_blank">
                    <Icon
                      boxSize="21px"
                      color="rgb(10, 102, 194)/70"
                      _hover={{ color: "rgb(10, 102, 194)" }}
                    >
                      <FaLinkedin />
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
                <Icon boxSize="4.5" color="fg.muted/65">
                  <GoOrganization />
                </Icon>
                {props.profile.company}
              </Flex>
            )}
            <Separator orientation="vertical" h="5" />

            {props.profile.country && (
              <Flex align="center" gap="1">
                <Icon boxSize="3.5" color="fg.subtle/60">
                  <FaLocationDot />
                </Icon>
                <Text color={style.color.help} fontSize={style.fontSize.help}>
                  {[props.profile.city, props.profile.country].filter(Boolean).join(", ")}
                </Text>
              </Flex>
            )}
          </Flex>

          {props.profile.career_stage.length > 0 && (
            <Flex align="center" gap="2">
              <Icon boxSize="4" color="fg.muted/65">
                <BsBriefcase />
              </Icon>
              <Text color={style.color.data} fontSize={style.fontSize.data}>
                {props.profile.career_stage.join(", ")}
              </Text>
            </Flex>
          )}
        </Stack>

        <MatchSection profile={props.profile} isEnrichedByGraphql={props.isEnrichedByGraphql} />
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

const ProfileMatchScoreUpdateMutation = graphql.persisted(
  "ProfileMatchScoreUpdate",
  graphql(`
    mutation ProfileMatchScoreUpdate($profileId: ID!, $matchScore: Int!) {
      profile_match_score_update(profile_id: $profileId, match_score: $matchScore)
    }
  `),
);

// #AI
function scoreToStars(score: number | null | undefined): number {
  if (score == null) {
    return 0;
  }
  // 0/100 -> 0/5, increments in 0.5
  return Math.round(score / 10) * 0.5;
}

// #AI
function MatchSection(props: { profile: ProfileFragmentType; isEnrichedByGraphql: boolean }) {
  const state = useStateValtio({
    hasUserRated: props.profile.match?.match_score != null,
    reviewSaveStatus: "idle" as "idle" | "saving" | "saved",
  });
  const match = props.profile.match;

  const debouncedSaveReview = useDebouncedCallback(async (review: string) => {
    state.mutable.reviewSaveStatus = "saving";
    await mutateAndRefetchMountedQueries(ProfileMatchReviewUpdateMutation, {
      profileId: props.profile.id,
      matchReview: review,
    });
    state.mutable.reviewSaveStatus = "saved";
    setTimeout(() => {
      state.mutable.reviewSaveStatus = "idle";
    }, 1500);
  }, 800);

  const isShowReviewInput = state.snap.hasUserRated || match?.match_score != null;

  // if it's an Algolia hit, it'll have it #AI
  const needsReprocessing =
    (props.profile as Record<string, unknown>).needs_reprocessing === true;

  return (
    <Stack gap="gap.sm" align="flex-end" minW="200px" h="auto">
      <HStack gap="gap.sm2">
        {!props.isEnrichedByGraphql ? (
          <Spinner size="xs" color="fg.subtle" />
        ) : (
          <>
            {match?.match_score_by_llm != null && (
              <MatchRating
                value={scoreToStars(match.match_score_by_llm)}
                readOnly
                helpText="Match rating by AI"
              />
            )}
            <MatchRating
              defaultValue={scoreToStars(match?.match_score)}
              colorPalette="teal"
              onValueChange={async details => {
                state.mutable.hasUserRated = true;
                await mutateAndRefetchMountedQueries(ProfileMatchScoreUpdateMutation, {
                  profileId: props.profile.id,
                  matchScore: details.value * 20,
                });
              }}
              helpText="Rate this match by AI for calibration"
            />
          </>
        )}
      </HStack>

      {match?.match_reason_by_llm && (
        <Text fontSize="xs" color="fg.muted" maxW="300px" lineClamp={2}>
          {match.match_reason_by_llm}
        </Text>
      )}

      {isShowReviewInput && (
        <Box position="relative" maxW="400px" minW="240px" w="full">
          <Textarea
            autoresize
            rows={1}
            resize="none"
            overflow="hidden"
            placeholder="Review for AI..."
            size="xs"
            defaultValue={match?.match_review ?? ""}
            onChange={e => debouncedSaveReview(e.target.value)}
          />
          <ReviewSaveIndicator status={state.snap.reviewSaveStatus} />
        </Box>
      )}
    </Stack>
  );
}

// #AI
function ReviewSaveIndicator(props: { status: "idle" | "saving" | "saved" }) {
  if (props.status === "idle") {
    return null;
  }

  return (
    <Box position="absolute" top="0" right="2">
      {props.status === "saving" ? (
        <Spinner size="xs" color="fg.subtle" />
      ) : (
        <Icon animation="fade-in 200ms" color="fg.subtle" boxSize="3.5">
          <LuCheck />
        </Icon>
      )}
    </Box>
  );
}

const ProfileMatchReviewUpdateMutation = graphql.persisted(
  "ProfileMatchReviewUpdate",
  graphql(`
    mutation ProfileMatchReviewUpdate($profileId: ID!, $matchReview: String!) {
      profile_match_review_update(profile_id: $profileId, match_review: $matchReview)
    }
  `),
);

function MatchRating(props: {
  value?: number;
  defaultValue?: number;
  colorPalette?: string;
  readOnly?: boolean;
  onValueChange?: (details: { value: number }) => void;
  helpText?: string;
}) {
  return (
    <HStack align="center">
      <RatingGroup.Root
        allowHalf
        count={5}
        size="md"
        value={props.value}
        defaultValue={props.defaultValue}
        colorPalette={props.colorPalette}
        readOnly={props.readOnly}
        onValueChange={props.onValueChange}
      >
        {!props.readOnly && <RatingGroup.HiddenInput />}
        {/* custom icon doesn't work with _hover */}
        {/*{[1, 2, 3, 4, 5].map((_, index) => (*/}
        {/*  // biome-ignore lint/suspicious/noArrayIndexKey: static*/}
        {/*  <RatingGroup.Item key={index} index={index + 1}>*/}
        {/*    <RatingGroup.ItemIndicator icon={<FaStar />} />*/}
        {/*  </RatingGroup.Item>*/}
        {/*))}*/}
        <RatingGroup.Control />
      </RatingGroup.Root>
      {props.helpText && (
        <Tooltip
          content={props.helpText}
          openDelay={400}
          closeDelay={100}
          closeOnClick={false}
          positioning={{ placement: "right" }}
        >
          <Icon
            color="fg.subtle/50"
            _hover={{ color: "fg", cursor: "help" }}
            boxSize="3.5"
            mt="1px"
          >
            <MdInfoOutline />
          </Icon>
        </Tooltip>
      )}
    </HStack>
  );
}

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

// #AI
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
    data: "fg",
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
