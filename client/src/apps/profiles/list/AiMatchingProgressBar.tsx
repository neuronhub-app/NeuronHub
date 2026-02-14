/**
 * #AI
 */
import { HStack, Progress, Spinner, Stack, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";

export const ProfileMatchProgressQuery = graphql.persisted(
  "ProfileMatchProgress",
  graphql(`
    query ProfileMatchProgress {
      profile_match_progress {
        total
        processed
        is_processing
        percent
        model
      }
    }
  `),
);

const ProfileMatchesCancelLlmMutation = graphql.persisted(
  "ProfileMatchesCancelLlm",
  graphql(`
    mutation ProfileMatchesCancelLlm {
      profile_matches_cancel_llm
    }
  `),
);

export function AiMatchingProgressBar() {
  const { data, refetch } = useApolloQuery(ProfileMatchProgressQuery, {});
  const cancelLoading = useIsLoading();

  const progress = data?.profile_match_progress;

  useEffect(() => {
    if (!progress?.is_processing) {
      return;
    }

    const interval = setInterval(() => {
      refetch();
    }, 4000);

    return () => clearInterval(interval);
  }, [progress?.is_processing, refetch]);

  if (!progress?.is_processing) {
    return null;
  }

  async function handleCancel() {
    await client.mutate({ mutation: ProfileMatchesCancelLlmMutation });
    refetch();
  }

  return (
    <Stack gap="gap.sm" {...ids.set(ids.profile.llm.progressBar)}>
      <HStack justify="space-between" align="center">
        <HStack gap="gap.sm">
          <Spinner size="xs" />
          <Text fontSize="sm" color="fg.subtle">
            AI Processing ({progress.model ?? "haiku"}): {progress.processed} / {progress.total}{" "}
            profiles, 10 per batch
          </Text>
        </HStack>
        <Button
          size="2xs"
          variant="subtle"
          colorPalette="red"
          onClick={() => cancelLoading.track(handleCancel)}
          loading={cancelLoading.isActive}
          {...ids.set(ids.profile.llm.cancelButton)}
        >
          Cancel
        </Button>
      </HStack>
      <Progress.Root value={progress.percent} max={100} size="sm">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Stack>
  );
}
