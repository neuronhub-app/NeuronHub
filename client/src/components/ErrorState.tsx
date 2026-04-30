import { env } from "@/env";
import { Button, EmptyState, HStack, Icon, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoAlert } from "react-icons/go";
import * as Sentry from "@sentry/react";

export function ErrorState(props: { title?: string; description?: ReactNode }) {
  return (
    <EmptyState.Root size="lg" py="gap.xl" mt="gap.md">
      <EmptyState.Content>
        <EmptyState.Indicator>
          <Icon color="fg.warning">
            <GoAlert />
          </Icon>
        </EmptyState.Indicator>
        <Stack textAlign="center" gap="2">
          <EmptyState.Title>{props.title ?? "An error occurred"}</EmptyState.Title>
          <EmptyState.Description>
            {props.description ??
              `Our team has been notified. Please try reloading or reach out at ${env.VITE_ADMIN_EMAIL}.`}
          </EmptyState.Description>
        </Stack>
        <HStack gap="gap.sm">
          <Button variant="subtle" onClick={() => window.location.reload()}>
            Reload page
          </Button>

          <Button variant="ghost" onClick={openSentryFeedback}>
            Send feedback
          </Button>
        </HStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

async function openSentryFeedback() {
  const feedback = Sentry.getFeedback();
  if (!feedback) {
    Sentry.captureException(new Error("Failed to open feedback form"));
    return;
  }
  const form = await feedback.createForm();
  form.appendToDom();
  form.open();
}
