import { Badge, Flex, HStack, Heading, type JsxStyleProps, Stack, Text } from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { Highlight, Snippet } from "react-instantsearch";
import { Prose } from "@/components/ui/prose";
import { ids } from "@/e2e/ids";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";
import { markedConfigured } from "@/utils/marked-configured";

export function ProfileCard(props: { profile: ProfileFragmentType; isSearchActive?: boolean }) {
  const p = props.profile;
  const hit = p as unknown as Hit<BaseHit>;

  const location = [p.city, p.country].filter(Boolean).join(", ");
  const matchScore = p.my_match?.match_score ?? p.my_match?.match_score_by_llm;
  const isHighlightable = props.isSearchActive && "_highlightResult" in p;

  return (
    <Stack
      as="article"
      gap="gap.md"
      bg="bg.light"
      p="gap.md"
      borderRadius="lg"
      border="1px solid"
      borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
      {...ids.set(ids.profile.card.container)}
    >
      <HStack justify="space-between" align="flex-start">
        <Stack gap="gap.sm">
          <HStack gap="gap.md" align="baseline">
            <Heading fontSize="md" fontWeight="medium">
              {isHighlightable ? (
                <>
                  <Highlight attribute="first_name" hit={hit} />{" "}
                  <Highlight attribute="last_name" hit={hit} />
                </>
              ) : (
                `${p.first_name} ${p.last_name}`
              )}
            </Heading>
            {location && (
              <Text color={style.color.help} fontSize={style.fontSize.help}>
                {location}
              </Text>
            )}
          </HStack>

          {(p.job_title || p.company) && (
            <Text color={style.color.data} fontSize={style.fontSize.data}>
              {[p.job_title, p.company].filter(Boolean).join(" @ ")}
            </Text>
          )}
        </Stack>

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

      <ProfileContentSection
        label="Bio"
        text={p.biography}
        snippetAttribute="biography"
        profile={p}
        isSearchActive={props.isSearchActive}
      />

      <HStack gap="gap.lg" align="flex-start" flexWrap="wrap">
        <ProfileContentSection
          label="Seeks"
          text={p.seeks}
          snippetAttribute="seeks"
          profile={p}
          isSearchActive={props.isSearchActive}
          flex="1"
          minW="200px"
        />

        <ProfileContentSection
          label="Offers"
          text={p.offers}
          snippetAttribute="offers"
          profile={p}
          isSearchActive={props.isSearchActive}
          flex="1"
          minW="200px"
        />
      </HStack>

      {(p.skills?.length > 0 || p.interests?.length > 0) && (
        <HStack gap="gap.lg" align="flex-start" flexWrap="wrap">
          {p.skills?.length > 0 && (
            <Stack gap="gap.xs">
              <Text fontSize="xs" color={style.color.label} fontWeight="medium">
                Skills
              </Text>
              <Flex gap="gap.sm" flexWrap="wrap">
                {p.skills.map(skill => (
                  <Badge key={skill.id} variant="outline" size="sm" colorPalette="gray">
                    {skill.name}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          )}

          {p.interests?.length > 0 && (
            <Stack gap="gap.xs">
              <Text fontSize="xs" color={style.color.label} fontWeight="medium">
                Interests
              </Text>
              <Flex gap="gap.sm" flexWrap="wrap">
                {p.interests.map(interest => (
                  <Badge key={interest.id} variant="outline" size="sm" colorPalette="blue">
                    {interest.name}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          )}
        </HStack>
      )}
    </Stack>
  );
}

function ProfileContentSection(props: {
  label: string;
  text?: string | null;
  snippetAttribute: string;
  profile: ProfileFragmentType;
  isSearchActive?: boolean;
  flex?: string;
  minW?: string;
}) {
  if (!props.text) {
    return null;
  }

  const hasSnippet = props.isSearchActive && "_snippetResult" in props.profile;

  return (
    <Stack gap="gap.xs" flex={props.flex} minW={props.minW}>
      <Text fontSize="xs" color={style.color.label} fontWeight="medium">
        {props.label}
      </Text>
      {hasSnippet ? (
        <Text
          color="fg.muted"
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
          {...ids.set(ids.profile.card.contentMarkdown)}
        />
      )}
    </Stack>
  );
}

const style = {
  color: {
    data: "fg.subtle",
    help: "fg.subtle",
    label: "fg.subtle",
  } satisfies { [key: string]: JsxStyleProps["color"] },
  fontSize: {
    data: "sm",
    help: "sm",
  } satisfies { [key: string]: JsxStyleProps["fontSize"] },
} as const;
