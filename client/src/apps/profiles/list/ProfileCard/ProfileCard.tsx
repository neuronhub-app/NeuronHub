import { Badge, Flex, HStack, type JsxStyleProps, Stack, Text } from "@chakra-ui/react";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";

export function ProfileCard(props: { profile: ProfileFragmentType }) {
  const p = props.profile;

  const location = [p.city, p.country].filter(Boolean).join(", ");
  const matchScore = p.my_match?.match_score ?? p.my_match?.match_score_by_llm;

  return (
    <HStack as="article" gap="gap.md" align="flex-start">
      <Stack w="full" gap="3px">
        <HStack justify="space-between" align="flex-start">
          <Stack gap="gap.sm">
            <HStack gap="gap.md" align="baseline">
              <Text fontWeight="medium">
                {p.first_name} {p.last_name}
              </Text>
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

        {p.biography && (
          <Text color="fg.muted" fontSize="sm" lineClamp={2}>
            {p.biography}
          </Text>
        )}

        {p.skills?.length > 0 && (
          <Flex gap="gap.sm" flexWrap="wrap">
            {p.skills.map(skill => (
              <Badge key={skill.id} variant="outline" size="sm" colorPalette="gray">
                {skill.name}
              </Badge>
            ))}
          </Flex>
        )}
      </Stack>
    </HStack>
  );
}

const style = {
  color: {
    data: "fg.subtle",
    help: "fg.subtle",
  } satisfies { [key: string]: JsxStyleProps["color"] },
  fontSize: {
    data: "sm",
    help: "sm",
  } satisfies { [key: string]: JsxStyleProps["fontSize"] },
} as const;
