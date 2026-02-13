/**
 * #AI
 */
import { Container, HStack, Span, Stack, Text, Textarea } from "@chakra-ui/react";
import { useRef } from "react";
import { LuCheck } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useStateValtio } from "@/utils/useValtioProxyRef";

export default function LlmProfile() {
  const { data, isLoadingFirstTime, refetch } = useApolloQuery(MyLlmProfileQuery);
  const profile = data?.my_profile;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSkipAutoChangesAutoSavingRef = useRef(false);

  const state = useStateValtio({
    saveStatus: "idle" as "idle" | "saving" | "saved",
    showConfirmDialog: false,
    isResetting: false,
  });

  const debouncedSave = useDebouncedCallback(async (value: string) => {
    if (isSkipAutoChangesAutoSavingRef.current) {
      isSkipAutoChangesAutoSavingRef.current = false;
      return;
    }
    state.mutable.saveStatus = "saving";
    await mutateAndRefetchMountedQueries(ProfileLlmMdUpdateMutation, {
      profileForLlmMd: value,
    });
    state.mutable.saveStatus = "saved";
    setTimeout(() => {
      state.mutable.saveStatus = "idle";
    }, 2000);
  }, 1000);

  const handleResetToAutoGeneration = async () => {
    state.mutable.isResetting = true;
    try {
      // Cancel any pending debounced save to prevent re-enabling custom mode
      debouncedSave.cancel();
      state.mutable.saveStatus = "idle";

      await mutateAndRefetchMountedQueries(ProfileLlmMdResetMutation, {});
      const result = await refetch();
      state.mutable.showConfirmDialog = false;
      const newProfileMd = result.data?.my_profile?.profile_for_llm_md;
      if (textareaRef.current && newProfileMd) {
        // Set flag to prevent onChange from triggering a save
        isSkipAutoChangesAutoSavingRef.current = true;
        textareaRef.current.value = newProfileMd;
      }
    } finally {
      state.mutable.isResetting = false;
    }
  };

  if (isLoadingFirstTime) return null;

  if (!profile) {
    return (
      <Container maxW="xl" py={10} m={0} px={1}>
        <Text color="fg.muted">No profile found. Import or create a profile first.</Text>
      </Container>
    );
  }

  return (
    <>
      <Container maxW="4xl" py={10} m={0} px={1}>
        <Stack gap="4">
          <Stack gap="1">
            <Text fontWeight="medium">LLM Profile Markdown</Text>
            <Text color="fg.muted" textStyle="sm">
              This text is sent to the LLM for matching. Edit it to customize how the LLM sees
              your profile.
            </Text>
          </Stack>

          <Textarea
            ref={textareaRef}
            w="full"
            rows={30}
            fontFamily="mono"
            textStyle="sm"
            autoresize
            resize="vertical"
            defaultValue={profile.profile_for_llm_md}
            onChange={e => debouncedSave(e.target.value)}
          />

          <HStack w="full" justify="space-between">
            <Text color="fg.muted" textStyle="xs">
              {profile.is_profile_custom
                ? "Custom profile active — edits saved automatically"
                : "Auto-generated — edit to customize"}
            </Text>
            <SaveStatus status={state.snap.saveStatus} />
          </HStack>

          <Checkbox
            checked={!profile.is_profile_custom}
            onCheckedChange={async details => {
              if (details.checked) {
                // User wants to enable auto-generation (custom → auto)
                state.mutable.showConfirmDialog = true;
              } else {
                // User wants to disable auto-generation (auto → custom)
                // Just set the flag without changing content
                debouncedSave.cancel();
                state.mutable.saveStatus = "saving";
                await mutateAndRefetchMountedQueries(ProfileLlmMdUpdateMutation, {
                  profileForLlmMd: textareaRef.current?.value || profile.profile_for_llm_md,
                });
                state.mutable.saveStatus = "saved";
                setTimeout(() => {
                  state.mutable.saveStatus = "idle";
                }, 2000);
                await refetch();
              }
            }}
          >
            Auto-generate profile from data
          </Checkbox>
        </Stack>
      </Container>

      <DialogRoot
        size="xs"
        role="alertdialog"
        open={state.snap.showConfirmDialog}
        onOpenChange={() => {
          if (!state.snap.isResetting) {
            state.mutable.showConfirmDialog = false;
          }
        }}
      >
        <DialogContent
          onKeyDown={e => {
            if (e.key === "Enter" && !state.snap.isResetting) {
              e.preventDefault();
              handleResetToAutoGeneration();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Re-enable auto-generation?</DialogTitle>
            <DialogCloseTrigger disabled={state.snap.isResetting} />
          </DialogHeader>
          <DialogBody>
            <DialogDescription>
              This will{" "}
              <Span fontWeight="medium" color="fg">
                discard your custom profile
              </Span>{" "}
              and regenerate it automatically from your profile data.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={handleResetToAutoGeneration}
              flex="1"
              loading={state.snap.isResetting}
              disabled={state.snap.isResetting}
            >
              Re-enable auto-generation
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

const MyLlmProfileQuery = graphql.persisted(
  "MyLlmProfile",
  graphql(`
    query MyLlmProfile {
      my_profile {
        id
        profile_for_llm_md
        is_profile_custom
      }
    }
  `),
);

const ProfileLlmMdUpdateMutation = graphql.persisted(
  "ProfileLlmMdUpdate",
  graphql(`
    mutation ProfileLlmMdUpdate($profileForLlmMd: String!) {
      profile_llm_md_update(profile_for_llm_md: $profileForLlmMd)
    }
  `),
);

const ProfileLlmMdResetMutation = graphql.persisted(
  "ProfileLlmMdReset",
  graphql(`
    mutation ProfileLlmMdReset {
      profile_llm_md_reset
    }
  `),
);

function SaveStatus(props: { status: "idle" | "saving" | "saved" }) {
  if (props.status === "saving") {
    return (
      <Text textStyle="xs" color="fg.muted">
        Saving...
      </Text>
    );
  }
  if (props.status === "saved") {
    return (
      <HStack gap="1" color="fg.success">
        <LuCheck />
      </HStack>
    );
  }
  return null;
}
