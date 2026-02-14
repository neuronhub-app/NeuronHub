/**
 * #AI
 */
import {
  Collapsible,
  NativeSelect,
  NumberInput,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { ProfileMatchProgressQuery } from "@/apps/profiles/list/AiMatchingProgressBar";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";

const ProfileMatchesTriggerLlmMutation = graphql.persisted(
  "ProfileMatchesTriggerLlm",
  graphql(`
    mutation ProfileMatchesTriggerLlm($limit: Int!, $model: String!) {
      profile_matches_trigger_llm(limit: $limit, model: $model) {
        total
        processed
        is_processing
        model
      }
    }
  `),
);

const ProfileUserLlmMdQuery = graphql.persisted(
  "ProfileUserLlmMd",
  graphql(`
    query ProfileUserLlmMd {
      profile_user_llm_md
    }
  `),
);

export function AiMatchingButtonTrigger() {
  const loading = useIsLoading();
  const [model, setModel] = useState("haiku");
  const [limit, setLimit] = useState(40);
  const [isOpen, setIsOpen] = useState(false);
  const { data: profileData } = useApolloQuery(ProfileUserLlmMdQuery, {});

  const profileMd = profileData?.profile_user_llm_md ?? "";

  async function handleTrigger() {
    setIsOpen(false);
    await client.mutate({
      mutation: ProfileMatchesTriggerLlmMutation,
      variables: { limit, model },
    });
    await client.refetchQueries({ include: [ProfileMatchProgressQuery] });
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={e => setIsOpen(e.open)}>
      <Popover.Trigger asChild>
        <Button size="sm" variant="outline" {...ids.set(ids.profile.llm.triggerButton)}>
          Run AI Matching
        </Button>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content w="320px">
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
                      onChange={e => setModel(e.target.value)}
                      {...ids.set(ids.profile.llm.modelSelect)}
                    >
                      <option value="haiku">Haiku (fast, cheap)</option>
                      <option value="sonnet">Sonnet (smart)</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Stack>

                <Stack gap="gap.sm">
                  <Text fontSize="sm" fontWeight="medium">
                    Profile limit
                  </Text>
                  <NumberInput.Root
                    size="sm"
                    min={1}
                    max={500}
                    value={String(limit)}
                    onValueChange={e => setLimit(Number(e.value))}
                  >
                    <NumberInput.Input {...ids.set(ids.profile.llm.limitInput)} />
                    <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control>
                  </NumberInput.Root>
                </Stack>

                {profileMd && (
                  <Collapsible.Root>
                    <Collapsible.Trigger asChild>
                      <Button variant="plain" size="xs" colorPalette="gray" gap="gap.sm">
                        Your profile preview
                        <Collapsible.Indicator
                          transition="transform 0.2s"
                          _open={{ transform: "rotate(180deg)" }}
                        >
                          <LuChevronDown />
                        </Collapsible.Indicator>
                      </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <Text
                        fontSize="xs"
                        color="fg.muted"
                        whiteSpace="pre-wrap"
                        maxH="200px"
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
