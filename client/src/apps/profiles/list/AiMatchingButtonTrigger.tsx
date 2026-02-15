/**
 * #AI
 */
import {
  Box,
  Collapsible,
  HStack,
  Link,
  NativeSelect,
  NumberInput,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown, LuTriangleAlert } from "react-icons/lu";
import { NavLink } from "react-router";
import { ProfileMatchProgressQuery } from "@/apps/profiles/list/AiMatchingProgressBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { useIsLoading } from "@/utils/useIsLoading";

const ProfileMatchesTriggerLlmMutation = graphql.persisted(
  "ProfileMatchesTriggerLlm",
  graphql(`
    mutation ProfileMatchesTriggerLlm($limit: Int!, $model: String!, $includeReprocessing: Boolean!) {
      profile_matches_trigger_llm(limit: $limit, model: $model, include_reprocessing: $includeReprocessing) {
        total
        processed
        is_processing
        model
      }
    }
  `),
);

export const ProfileUserLlmMdQuery = graphql.persisted(
  "ProfileUserLlmMd",
  graphql(`
    query ProfileUserLlmMd {
      profile_user_llm_md
    }
  `),
);

const ProfileMatchStatsQuery = graphql.persisted(
  "ProfileMatchStats",
  graphql(`
    query ProfileMatchStats {
      profile_match_stats {
        rated_count
        llm_scored_count
        unprocessed_count
        needs_reprocessing_count
      }
    }
  `),
);

const MODEL_LIMITS = {
  haiku: { max: 500, default: 250 },
  sonnet: { max: 100, default: 50 },
} as const;

const SONNET_MIN_RATED = 10;
const SONNET_MIN_LLM_SCORED = 200;

export function AiMatchingButtonTrigger() {
  const loading = useIsLoading();
  const [model, setModel] = useState<"haiku" | "sonnet">("haiku");
  const [limit, setLimit] = useState<number>(MODEL_LIMITS.haiku.default);
  const [includeReprocessing, setIncludeReprocessing] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { data: profileData } = useApolloQuery(ProfileUserLlmMdQuery, {});
  const { data: statsData } = useApolloQuery(ProfileMatchStatsQuery, {});

  const profileMd = profileData?.profile_user_llm_md ?? "";
  const stats = statsData?.profile_match_stats;
  const ratedCount = stats?.rated_count ?? 0;
  const llmScoredCount = stats?.llm_scored_count ?? 0;
  const unprocessedCount = stats?.unprocessed_count ?? 0;
  const needsReprocessingCount = stats?.needs_reprocessing_count ?? 0;

  const isSonnetAllowed =
    ratedCount >= SONNET_MIN_RATED && llmScoredCount >= SONNET_MIN_LLM_SCORED;

  const currentLimits = MODEL_LIMITS[model];

  function handleModelChange(newModel: "haiku" | "sonnet") {
    setModel(newModel);
    setLimit(MODEL_LIMITS[newModel].default);
  }

  async function handleTrigger() {
    setIsOpen(false);
    await client.mutate({
      mutation: ProfileMatchesTriggerLlmMutation,
      variables: { limit, model, includeReprocessing },
    });
    await client.refetchQueries({ include: [ProfileMatchProgressQuery] });
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={e => setIsOpen(e.open)}>
      <Popover.Trigger asChild>
        <Button
          colorPalette="teal"
          size="sm"
          variant="solid"
          {...ids.set(ids.profile.llm.triggerButton)}
        >
          Run AI Matching
        </Button>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content w="500px">
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="gap.md">
                <Stack gap="gap.sm">
                  <Text fontSize="sm" fontWeight="medium">
                    Model
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={model}
                      onChange={e => handleModelChange(e.target.value as "haiku" | "sonnet")}
                      {...ids.set(ids.profile.llm.modelSelect)}
                    >
                      <option value="haiku">Haiku (fast, cheap)</option>
                      <option value="sonnet">Sonnet (smart)</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>

                  {model === "sonnet" && !isSonnetAllowed && (
                    <Stack gap="1" direction="row" align="flex-start" color="fg.warning">
                      <LuTriangleAlert style={{ marginTop: 2, flexShrink: 0 }} />
                      <Stack gap="0">
                        <Text fontSize="xs">For good Sonnet calibration, firstly, please:</Text>

                        <Box as="ul" listStyleType="circle">
                          <Text
                            as="li"
                            fontSize="xs"
                            _marker={{
                              color:
                                llmScoredCount >= SONNET_MIN_LLM_SCORED
                                  ? "fg.success"
                                  : "fg.warning",
                            }}
                          >
                            Run at least {SONNET_MIN_LLM_SCORED} Haiku matches ({llmScoredCount}/
                            {SONNET_MIN_LLM_SCORED})
                          </Text>
                          <Text
                            as="li"
                            fontSize="xs"
                            _marker={{
                              color:
                                ratedCount >= SONNET_MIN_RATED ? "fg.success" : "fg.warning",
                            }}
                          >
                            Rate at least {SONNET_MIN_RATED} Profiles ({ratedCount}/
                            {SONNET_MIN_RATED})
                          </Text>
                        </Box>
                      </Stack>
                    </Stack>
                  )}

                  <Stack gap="gap.sm">
                    <Text fontSize="xs" color="fg.muted">
                      Profiles not processed: {unprocessedCount}
                    </Text>
                    <Checkbox
                      size="sm"
                      checked={includeReprocessing}
                      onCheckedChange={e => setIncludeReprocessing(!!e.checked)}
                    >
                      <Text fontSize="xs">
                        Include re-processing ({needsReprocessingCount} changed)
                      </Text>
                    </Checkbox>
                  </Stack>
                </Stack>

                <Stack gap="gap.sm">
                  <Text fontSize="sm" fontWeight="medium">
                    Profile limit
                  </Text>
                  <NumberInput.Root
                    size="sm"
                    min={1}
                    max={currentLimits.max}
                    value={String(limit)}
                    onValueChange={e => setLimit(Number(e.value))}
                  >
                    <NumberInput.Input {...ids.set(ids.profile.llm.limitInput)} />
                    <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control>
                  </NumberInput.Root>
                  <Text fontSize="xs" color="fg.muted">
                    Note: at a time the max is {currentLimits.max} for{" "}
                    {model === "haiku" ? "Haiku" : "Sonnet"}
                  </Text>
                </Stack>

                {profileMd && (
                  <Collapsible.Root>
                    <HStack justify="space-between">
                      <Collapsible.Trigger asChild>
                        <Button variant="ghost" size="xs" colorPalette="gray" gap="gap.sm">
                          Your profile preview
                          <Collapsible.Indicator
                            transition="transform 0.2s"
                            _open={{ transform: "rotate(180deg)" }}
                          >
                            <LuChevronDown />
                          </Collapsible.Indicator>
                        </Button>
                      </Collapsible.Trigger>
                      <Link asChild fontSize="xs" target="_blank">
                        <NavLink to={urls.user.settings.llmProfile}>Override profile</NavLink>
                      </Link>
                    </HStack>

                    <Collapsible.Content>
                      <Text
                        fontSize="xs"
                        color="fg.muted"
                        whiteSpace="pre-wrap"
                        maxH="380px"
                        overflowY="auto"
                        p="gap.sm"
                        bg="bg.subtle"
                        borderRadius="sm"
                      >
                        {profileMd}
                      </Text>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )}

                <Button
                  size="sm"
                  onClick={() => loading.track(handleTrigger)}
                  loading={loading.isActive}
                  disabled={model === "sonnet" && !isSonnetAllowed}
                  {...ids.set(ids.profile.llm.submitButton)}
                >
                  Start Matching
                </Button>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
