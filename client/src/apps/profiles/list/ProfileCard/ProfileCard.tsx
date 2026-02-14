import {
  Bleed,
  Box,
  Center,
  Checkbox,
  Collapsible,
  Flex,
  Float,
  Heading,
  HStack,
  Icon,
  Link,
  RatingGroup,
  Separator,
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { type ReactNode, useEffect, useRef } from "react";
import { BsBriefcase } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import { GoOrganization } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { LuCheck, LuChevronDown } from "react-icons/lu";
import { MdInfoOutline, MdUnfoldLess, MdUnfoldMore } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
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

const style = {
  collapseHeight: {
    bio: "180px",
    seeksAndOffers: "180px",
  },
  header: {
    fontSize: "md",
    lineHeight: "inherit",
  },
  // #AI-slop, must be <Text {...style.data}/>
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
} as const;

// #AI
export function ProfileCard(props: {
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  isEnrichedByGraphql: boolean;
}) {
  const state = useStateValtio({ isSearchSnippetUnfolded: false });
  const isHighlightable = props.isSearchActive && "_highlightResult" in props.profile;
  const isSearchSnippetUnfolded = state.snap.isSearchSnippetUnfolded;

  const cardStyle = {
    padding: "gap.md",
  } as const;

  return (
    <Stack
      as="article"
      gap="gap.sm2"
      p={cardStyle.padding}
      borderRadius="lg"
      borderColor="border.subtle"
      position="relative"
      bg="bg.panel"
      {...ids.set(ids.profile.card.container)}
      data-id={props.profile.id}
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
              state.mutable.isSearchSnippetUnfolded = !state.snap.isSearchSnippetUnfolded;
            }}
            _hover={{
              bg: "bg.subtle",
            }}
            {...ids.set(ids.profile.card.unfoldBtn)}
          >
            <Icon boxSize="3.5">
              {isSearchSnippetUnfolded ? <MdUnfoldLess /> : <MdUnfoldMore />}
            </Icon>
            {isSearchSnippetUnfolded ? "Fold" : "Unfold"}
          </Button>
        </Float>
      )}

      <Stack gap="gap.sm2">
        <HStack gap="gap.md" align="flex-start" justify="space-between">
          <HStack gap="gap.md" align="flex-start">
            <ProfileNameLink profile={props.profile} isHighlightable={isHighlightable} />
            <Separator orientation="vertical" h="23px" />
            <Text color="fg.dark-friendly" {...style.header}>
              {props.profile.job_title}
            </Text>
          </HStack>
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

          {props.profile.company && props.profile.country && (
            <Separator orientation="vertical" h="5" />
          )}
          {props.profile.country && (
            <Flex align="center" gap="1">
              <Icon boxSize="19px" color="fg.subtle" ml="-1">
                <IoLocationOutline />
              </Icon>
              <Text color={style.color.help} fontSize={style.fontSize.help}>
                {[props.profile.city, props.profile.country].filter(Boolean).join(", ")}
              </Text>
            </Flex>
          )}

          {props.profile.country && props.profile.url_linkedin && (
            <Separator orientation="vertical" h="5" />
          )}
          {props.profile.url_linkedin && (
            <Link href={props.profile.url_linkedin} target="_blank">
              <Icon boxSize="19px" color="fg.subtle" _hover={{ color: "rgb(10, 102, 194)" }}>
                <FaLinkedin />
              </Icon>
            </Link>
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

      <ProfileContentSection
        label="Bio"
        text={props.profile.biography}
        snippetAttribute="biography"
        profile={props.profile}
        isSearchActive={props.isSearchActive}
        isSearchSnippetUnfolded={isSearchSnippetUnfolded}
        collapsedHeight={style.collapseHeight.bio}
      />

      {(props.profile.skills?.length > 0 || props.profile.interests?.length > 0) && (
        <>
          <HStack align="flex-start" flexWrap="wrap" gap="gap.md">
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
          <Spacer h="0" />
        </>
      )}

      <Flex mt="gap.sm">
        <SeeksOffersSection
          profile={props.profile}
          isSearchActive={props.isSearchActive}
          isUnfolded={isSearchSnippetUnfolded}
        />
      </Flex>
      <Bleed inline={cardStyle.padding}>
        <Separator color="bg.muted" size="xs" />
      </Bleed>

      <MatchSection profile={props.profile} isEnrichedByGraphql={props.isEnrichedByGraphql} />
    </Stack>
  );
}

function ProfileNameLink(props: { profile: ProfileFragmentType; isHighlightable?: boolean }) {
  function ProfileName() {
    const profileHit = props.profile as unknown as Hit<BaseHit>;
    return (
      <Heading {...style.header} fontWeight="semibold">
        {props.isHighlightable ? (
          <>
            <Highlight attribute="first_name" hit={profileHit} />{" "}
            <Highlight attribute="last_name" hit={profileHit} />
          </>
        ) : (
          `${props.profile.first_name} ${props.profile.last_name}`
        )}
      </Heading>
    );
  }

  return props.profile.url_conference ? (
    <Box className="group" cursor="pointer" pos="relative">
      <Link
        target="_blank"
        fontWeight="semibold"
        href={props.profile.url_conference}
        color={{ _light: "colorPalette.600/88", _dark: "colorPalette.400" }}
      >
        <ProfileName />
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
    <ProfileName />
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

// todo refac: move out
// #AI
function MatchSection(props: { profile: ProfileFragmentType; isEnrichedByGraphql: boolean }) {
  const match = props.profile.match;
  const state = useStateValtio({
    isReviewToggled: null as boolean | null,
    isUserHasRated: null as boolean | null,
    reviewSaveStatus: "idle" as "idle" | "saving" | "saved",
  });

  useEffect(() => {
    state.mutable.isUserHasRated = Boolean(match?.match_score);
  }, [match]);

  const isUserHasReview = !!match?.match_review;
  const isUserReviewOpen = state.snap.isReviewToggled ?? isUserHasReview;

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

  return (
    <Flex gap="gap.sm2" align="flex-start">
      {!props.isEnrichedByGraphql ? (
        <Spinner size="xs" color="fg.subtle" />
      ) : (
        <>
          <VStack align="flex-start" flex="1">
            <HStack align="center" gap="gap.sm2">
              <MatchRating
                defaultValue={scoreToStars(match?.match_score)}
                onValueChange={async details => {
                  state.mutable.isReviewToggled = true;
                  state.mutable.isUserHasRated = true;
                  await mutateAndRefetchMountedQueries(ProfileMatchScoreUpdateMutation, {
                    profileId: props.profile.id,
                    matchScore: details.value * 20,
                  });
                }}
                helpText="Rate this profile for AI calibration"
              />
              {state.snap.isUserHasRated && (
                <Checkbox.Root
                  checked={isUserReviewOpen}
                  onCheckedChange={details => {
                    state.mutable.isReviewToggled = !!details.checked;
                  }}
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label color="fg.subtle" fontSize="12px">
                    Review note
                  </Checkbox.Label>
                </Checkbox.Root>
              )}
            </HStack>
            {isUserReviewOpen && (
              <Box position="relative" maxW="400px" minW="240px" w="full">
                <Textarea
                  autoresize
                  rows={1}
                  resize="none"
                  overflow="hidden"
                  placeholder="Leave a review of this Profile for AI calibration"
                  size="xs"
                  defaultValue={match?.match_review ?? ""}
                  onChange={e => debouncedSaveReview(e.target.value)}
                />
                <ReviewSaveIndicator status={state.snap.reviewSaveStatus} />
              </Box>
            )}
          </VStack>
          <VStack align="flex-start" flex="1">
            {match?.match_score_by_llm != null && (
              <>
                <MatchRating
                  value={scoreToStars(match.match_score_by_llm)}
                  readOnly
                  helpText="Match rating by AI"
                  colorPalette="teal"
                />
                <Text fontSize="sm">
                  <Icon boxSize="4.5" color="fg.subtle" mr="gap.sm" mt="-2px">
                    <RiRobot2Line />
                  </Icon>
                  {match.match_reason_by_llm}
                </Text>
              </>
            )}
          </VStack>
        </>
      )}
    </Flex>
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

// todo refac: move out
function MatchRating(props: {
  value?: number;
  defaultValue?: number;
  matchReview?: string;
  colorPalette?: string;
  readOnly?: boolean;
  onValueChange?: (details: { value: number }) => void;
  helpText?: string;
}) {
  return (
    <VStack align="flex-start">
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
      {props.matchReview && (
        <Text fontSize="xs" color="fg.muted" maxW="300px" lineClamp={2}>
          {props.matchReview}
        </Text>
      )}
    </VStack>
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
            <Tag key={tag.name} variant="subtle" colorPalette={props.colorPalette}>
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
  isSearchSnippetUnfolded?: boolean;
  collapsedHeight?: string;
  flex?: string;
  minW?: string;
}) {
  if (!props.text) {
    return null;
  }

  const isSearchSnippet =
    props.isSearchActive && !props.isSearchSnippetUnfolded && "_snippetResult" in props.profile;

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
function SeeksOffersSection(props: {
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  isUnfolded?: boolean;
}) {
  if (!props.profile.seeks && !props.profile.offers) {
    return null;
  }

  return (
    <CollapsibleSection
      collapsedHeight={style.collapseHeight.seeksAndOffers}
      isSearchActive={props.isSearchActive}
    >
      <HStack align="flex-start" flexWrap="wrap" gap="gap.md">
        <ProfileContentSection
          label="Seeks"
          text={props.profile.seeks}
          snippetAttribute="seeks"
          profile={props.profile}
          isSearchActive={props.isSearchActive}
          isSearchSnippetUnfolded={props.isUnfolded}
          flex="1"
        />
        <ProfileContentSection
          label="Offers"
          text={props.profile.offers}
          snippetAttribute="offers"
          profile={props.profile}
          isSearchActive={props.isSearchActive}
          isSearchSnippetUnfolded={props.isUnfolded}
          flex="1"
        />
      </HStack>
    </CollapsibleSection>
  );
}

// #AI
// prev version rendered <Box> vs <Collapsible.Root> based on isOverflowing -> infinite re-render at 1500px+ due to scrollHeight oscillation
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
  }, []);

  const isExpanded = !state.snap.isOverflowing || props.isSearchActive || state.snap.isOpen;

  return (
    <Collapsible.Root
      collapsedHeight={props.collapsedHeight}
      open={isExpanded}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
      }}
    >
      <Collapsible.Content
        _closed={
          state.snap.isOverflowing
            ? {
                shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
                shadowColor: { _light: "blackAlpha.500", _dark: "whiteAlpha.300" },
              }
            : {}
        }
      >
        <Box ref={contentRef}>{props.children}</Box>
      </Collapsible.Content>

      {state.snap.isOverflowing && !props.isSearchActive && (
        <Center>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              colorPalette="gray"
              size="xs"
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
