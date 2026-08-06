import { Button, Checkbox, CheckboxGroup, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { LuCircleCheck } from "react-icons/lu";
import { z } from "zod";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { CommentPrompt } from "~/graphql/enums";

import { FormChakraTextarea } from "@/components/forms/FormChakraTextarea";
import { ids } from "@/e2e/ids";
import { type ResultOf, graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useIsLoading } from "@/utils/useIsLoading";

export function PgJobUnsubscribeFeedbackForm(props: { alertIdExt: string }) {
  const { data } = useApolloQuery(JobAlertUnsubscribeReasonsQuery);
  const reasons = data?.job_alert_unsubscribe_reasons ?? [];

  const loading = useIsLoading();

  const form = useForm({
    resolver: zodResolver(getFormSchema(reasons)),
    defaultValues: { reason_ids: [], comment: "" },
  });
  const reasonIds = useController({ control: form.control, name: "reason_ids" });

  const state = useStateValtio({ isSubmitted: false });

  async function submitFeedback(fields: z.infer<typeof FormSchema>) {
    const result = await mutateAndRefetchMountedQueries(JobAlertUnsubscribeFeedbackMutation, {
      id_ext: props.alertIdExt,
      reason_ids: fields.reason_ids,
      comment: fields.comment,
    });
    if (result.success) {
      state.mutable.isSubmitted = true;
    }
  }

  const style = {
    card: {
      p: "gap.lg",
      borderWidth: "1px",
      bg: "bg.panel",
      rounded: "lg",
    },
  } as const;

  if (state.snap.isSubmitted) {
    return (
      <HStack
        gap="gap.sm"
        {...style.card}
        {...ids.set(ids.job.subscriptions.feedback.submitted)}
      >
        <Icon size="md" color="green.solid">
          <LuCircleCheck />
        </Icon>
        <Text fontWeight="medium">Thank you, your feedback helps us to improve the alerts.</Text>
      </HStack>
    );
  }

  if (reasons.length === 0) {
    return null;
  }

  const reasonsWithComment = findReasonsWithComment(reasons, reasonIds.field.value);

  return (
    <Stack
      onSubmit={async event => {
        event.preventDefault();
        await loading.track(form.handleSubmit(submitFeedback));
      }}
      as="form"
      gap="gap.md"
      {...style.card}
      {...ids.set(ids.job.subscriptions.feedback.form)}
    >
      <Text>Do you mind letting us know why you unsubscribed?</Text>

      <CheckboxGroup
        value={reasonIds.field.value}
        name={reasonIds.field.name}
        onValueChange={reasonIds.field.onChange}
      >
        <Stack gap="gap.sm">
          {reasons.map(reason => (
            <Checkbox.Root key={reason.id} value={reason.id}>
              <Checkbox.HiddenInput onBlur={reasonIds.field.onBlur} />
              <Checkbox.Control
                {...ids.set(
                  reason.comment_prompt === CommentPrompt.None
                    ? ids.job.subscriptions.feedback.option
                    : ids.job.subscriptions.feedback.optionComment,
                )}
              />
              <Checkbox.Label fontWeight="normal">{reason.label}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </Stack>
      </CheckboxGroup>

      {reasonsWithComment.length > 0 && (
        <FormChakraTextarea
          field={{ control: form.control, name: "comment" }}
          placeholder="Tell us more"
          data-testid={ids.job.subscriptions.feedback.comment}
        />
      )}

      <Button
        disabled={reasonIds.field.value.length === 0}
        loading={loading.isActive}
        type="submit"
        size="sm"
        alignSelf="flex-start"
        {...ids.set(ids.job.subscriptions.feedback.submit)}
      >
        Submit
      </Button>
    </Stack>
  );
}

const FormSchema = z.object({
  reason_ids: z.array(z.string()),
  comment: z.string(),
});

// the rule depends on async admin-editable reasons - RHF re-reads the resolver on each render
function getFormSchema(reasons: Reasons) {
  return FormSchema.superRefine((fields, ctx) => {
    const reasonsWithComment = findReasonsWithComment(reasons, fields.reason_ids);
    const isCommentRequired = reasonsWithComment.some(
      reason => reason.comment_prompt === CommentPrompt.Required,
    );
    if (!isCommentRequired || fields.comment.trim()) {
      return;
    }
    ctx.addIssue({
      code: "custom",
      path: ["comment"],
      message: "Please tell us more - a single line is enough.",
    });
  });
}

function findReasonsWithComment(reasons: Reasons, reasonIds: string[]) {
  return reasons.filter(
    reason => reason.comment_prompt !== CommentPrompt.None && reasonIds.includes(reason.id),
  );
}

type Reasons = NonNullable<
  ResultOf<typeof JobAlertUnsubscribeReasonsQuery>["job_alert_unsubscribe_reasons"]
>;

export const JobAlertUnsubscribeReasonsQuery = graphql.persisted(
  "JobAlertUnsubscribeReasons",
  graphql(`
    query JobAlertUnsubscribeReasons {
      job_alert_unsubscribe_reasons {
        id
        label
        comment_prompt
      }
    }
  `),
);

export const JobAlertUnsubscribeFeedbackMutation = graphql.persisted(
  "JobAlertUnsubscribeFeedback",
  graphql(`
    mutation JobAlertUnsubscribeFeedback(
      $id_ext: UUID!
      $reason_ids: [ID!]!
      $comment: String!
    ) {
      job_alert_unsubscribe_feedback(id_ext: $id_ext, reason_ids: $reason_ids, comment: $comment)
    }
  `),
);
