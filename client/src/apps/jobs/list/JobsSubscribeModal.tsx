import { location_fields, LocationFacet } from "@/utils/useAlgoliaSearchClient";
import { Badge, Button, Flex, Group, Icon, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaBell } from "react-icons/fa6";
import { GoInfo } from "react-icons/go";
import { useCurrentRefinements } from "react-instantsearch";
import { z } from "zod";

import { useUser } from "@/apps/users/useUserCurrent";
import { salaryFormatter } from "@/sites/pg/components/PgFacetSalary";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import type { ButtonProps } from "@/components/ui/button";
import { useIsLoading } from "@/utils/useIsLoading";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

const FormSchema = z.object({
  email: z.email("Invalid email address"),
});

export function JobsSubscribeModal(props: { buttonProps?: ButtonProps }) {
  const user = useUser();
  const loading = useIsLoading();

  const refinesCurrent = useCurrentRefinements();

  const state = useStateValtio({
    isOpen: false,
  });

  const emailStoreKey = "job_alert_email";
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: user?.email ?? localStorage.getItem(emailStoreKey) ?? "" },
  });

  const refinesCurrentReadableMap = refinesCurrent.items.flatMap(item =>
    item.refinements.map(refinement => ({
      attribute: ATTRIBUTE_LABELS[item.attribute] ?? item.attribute,
      label:
        item.attribute === "salary_min"
          ? `${salaryFormatter.format(refinement.value as number)}+`
          : refinement.label,
    })),
  );

  async function handleSubscribe(fields: z.infer<typeof FormSchema>) {
    const salaryRefinement = refinesCurrent.items.find(item => item.attribute === "salary_min");

    const result = await mutateAndRefetchMountedQueries(JobAlertSubscribeMutation, {
      email: fields.email,
      tag_names: refinesCurrent.items
        .filter(item => item.attribute.startsWith("tags_"))
        .flatMap(item => item.refinements.map(tag => String(tag.value))),
      location_names: refinesCurrent.items
        .filter(item => location_fields.all.includes(item.attribute as unknown as LocationFacet))
        .flatMap(item => item.refinements.map(ref => String(ref.value))),
      is_orgs_highlighted:
        refinesCurrent.items.some(item => item.attribute === "org.is_highlighted") ?? null,
      is_remote: refinesCurrent.items.some(item => item.attribute === "is_remote") ?? null,
      salary_min:
        salaryRefinement?.refinements[0]?.value != null
          ? Number(salaryRefinement.refinements[0].value)
          : null,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (result.success) {
      localStorage.setItem(emailStoreKey, fields.email);
      toast.success("Subscribed successfully");
      state.mutable.isOpen = false;
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          const email = user?.email ?? localStorage.getItem(emailStoreKey) ?? "";
          if (email && !form.getValues("email")) {
            form.setValue("email", email);
          }
          state.mutable.isOpen = true;
        }}
        {...props.buttonProps}
        {...ids.set(ids.job.alert.subscribeBtn)}
      >
        <Icon boxSize="3.5">
          <FaBell />
        </Icon>
        Get job alerts
      </Button>

      <DialogRoot
        open={state.snap.isOpen}
        onOpenChange={event => {
          state.mutable.isOpen = event.open;

          if (!event.open) {
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to new job posts</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <form
            onSubmit={async event => {
              event.preventDefault();
              await loading.track(async () => {
                await form.handleSubmit(handleSubscribe)();
              });
            }}
          >
            <DialogBody pt="0">
              <Stack gap="gap.md">
                <FormChakraInput
                  control={form.control}
                  name="email"
                  placeholder="your@email.com"
                  inputProps={{
                    type: "email",
                    autoFocus: true,
                    ...ids.set(ids.job.alert.emailInput),
                  }}
                />

                {refinesCurrentReadableMap.length > 0 ? (
                  <Stack gap="gap.sm">
                    <Text fontSize="sm" fontWeight="medium">
                      Filters
                    </Text>
                    <Flex gap="gap.sm" flexWrap="wrap">
                      {refinesCurrentReadableMap.map(facet => (
                        <Group
                          key={`${facet.attribute}-${facet.label}`}
                          attached
                          colorPalette="teal"
                        >
                          <Badge>{facet.attribute}</Badge>
                          <Badge variant="solid">{facet.label}</Badge>
                        </Group>
                      ))}
                    </Flex>
                    <Text fontSize="xs" color="fg.muted">
                      Updates sent daily when new jobs match.
                    </Text>
                  </Stack>
                ) : (
                  <Flex align="center" color="fg.info" gap="gap.sm">
                    <Icon>
                      <GoInfo />
                    </Icon>
                    <Text fontSize="xs">
                      No filters selected - you'll be notified about all new jobs.
                    </Text>
                  </Flex>
                )}
              </Stack>
            </DialogBody>

            <DialogFooter pt="0">
              <Stack align="flex-end">
                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={loading.isActive}
                  size="lg"
                  {...ids.set(ids.job.alert.submitBtn)}
                >
                  Subscribe
                </Button>
              </Stack>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  "tags_skill.name": "Skill",
  "tags_area.name": "Area",
  "tags_experience.name": "Experience",
  "tags_education.name": "Education",
  "tags_workload.name": "Workload",
  is_remote: "Remote",
  "org.is_highlighted": "Highlighted",
  "org.name": "Organization",
  salary_min: "Min Salary",
  posted_at: "Posted",
} as const;

export const JobAlertSubscribeMutation = graphql.persisted(
  "JobAlertSubscribe",
  graphql(`
    mutation JobAlertSubscribe(
      $email: String!
      $tag_names: [String!]
      $location_names: [String!]
      $is_orgs_highlighted: Boolean
      $is_remote: Boolean
      $salary_min: Int
      $tz: String
    ) {
      job_alert_subscribe(
        email: $email
        tag_names: $tag_names
        location_names: $location_names
        is_orgs_highlighted: $is_orgs_highlighted
        is_remote: $is_remote
        salary_min: $salary_min
        tz: $tz
      )
    }
  `),
);
