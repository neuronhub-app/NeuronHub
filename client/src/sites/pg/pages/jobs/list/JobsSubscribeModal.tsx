import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaBell } from "react-icons/fa6";
import { fromUnixTime } from "date-fns";
import { useCurrentRefinements } from "react-instantsearch";
import { z } from "zod";

import { useUser } from "@/apps/users/useUserCurrent";
import { JobAlertSubscribeMutation } from "@/apps/jobs/list/JobsSubscribeModal";
import { FormChakraInput } from "@/components/forms/FormChakraInput";
import {
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { ids } from "@/e2e/ids";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

const FormSchema = z.object({
  email: z.email("Invalid email address"),
});

export function JobsSubscribeModal() {
  const user = useUser();
  const loading = useIsLoading();

  const refinesCurrent = useCurrentRefinements();

  const state = useStateValtio({ isOpen: false });

  const emailStoreKey = "job_alert_email";
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: user?.email ?? localStorage.getItem(emailStoreKey) ?? "" },
  });

  const refinesCurrentReadableMap = refinesCurrent.items.flatMap(item =>
    item.refinements.map(refinement => ({
      attribute: ATTRIBUTE_LABELS[item.attribute] ?? item.attribute,
      label: getRefinementLabel(item.attribute, refinement),
    })),
  );

  async function handleSubscribe(fields: z.infer<typeof FormSchema>) {
    const salaryRefinement = refinesCurrent.items.find(item => item.attribute === "salary_min");

    const result = await mutateAndRefetchMountedQueries(JobAlertSubscribeMutation, {
      email: fields.email,
      tag_names: refinesCurrent.items
        .filter(item => item.attribute.startsWith("tags_"))
        .flatMap(item => item.refinements.map(tag => String(tag.value))),
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

  const hasFilters = refinesCurrentReadableMap.length > 0;

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
        variant={"pg-primary" as "solid"}
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
        <DialogContent
          bg="bg.card"
          fontFamily="body"
          maxW="390px"
          mx="gap.md"
          p={{ base: "gap.md", md: "gap.xl" }}
        >
          <DialogHeader p="0" mb={hasFilters ? "3" : "gap.lg"}>
            <Stack gap="1">
              <DialogTitle {...style.title} pr="10">
                {hasFilters
                  ? "Subscribe to new jobs that match your query"
                  : "Subscribe to all new job posts"}
              </DialogTitle>
              {!hasFilters && (
                <Text {...style.subtitle}>
                  To limit the alert to certain categories, apply a filter.
                </Text>
              )}
            </Stack>
          </DialogHeader>
          <DialogCloseTrigger
            top={{ base: "gap.md", md: "gap.xl" }}
            right={{ base: "gap.md", md: "gap.xl" }}
            color="brand.green"
          />

          <form
            onSubmit={async event => {
              event.preventDefault();
              await loading.track(async () => {
                await form.handleSubmit(handleSubscribe)();
              });
            }}
          >
            <Stack gap="gap.lg" mb="gap.lg">
              {hasFilters && (
                <Box bg="brand.green.subtle" borderRadius="md" px="gap.md" py="gap.md">
                  {refinesCurrentReadableMap.map(facet => (
                    <Text key={`${facet.attribute}-${facet.label}`} {...style.filterText}>
                      {facet.attribute}: {facet.label}
                    </Text>
                  ))}
                </Box>
              )}

              <FormChakraInput
                control={form.control}
                name="email"
                placeholder="name@example.com"
                inputProps={{
                  type: "email",
                  autoFocus: true,
                  bg: "white",
                  h: "10",
                  borderRadius: "md",
                  borderWidth: "1px",
                  borderColor: "brand.gray",
                  px: "gap.md",
                  _placeholder: { color: "fg.muted", fontSize: "sm" },
                  _focus: { borderColor: "brand.green.light", boxShadow: "none" },
                  ...ids.set(ids.job.alert.emailInput),
                }}
              />
            </Stack>

            <Flex align="flex-start" justify="space-between" gap="gap.sm">
              <Text {...style.footerText}>
                You will receive updates daily (if there are new roles) and you can unsubscribe
                at any time
              </Text>
              <Button
                type="submit"
                variant={"pg-primary" as "solid"}
                loading={loading.isActive}
                w="127px"
                {...ids.set(ids.job.alert.submitBtn)}
              >
                Subscribe
              </Button>
            </Flex>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  );
}

function getRefinementLabel(
  attribute: string,
  refinement: ReturnType<typeof useCurrentRefinements>["items"][number]["refinements"][number],
) {
  if (attribute === "posted_at_unix") {
    return `${refinement.operator} ${datetime.relative(fromUnixTime(refinement.value as number))}`;
  }
  return BOOLEAN_LABELS[String(refinement.label)] ?? String(refinement.label);
}

const style = {
  title: { fontFamily: "heading", fontSize: "lg", fontWeight: "medium", color: "fg" },
  subtitle: { fontSize: "sm", color: "fg.secondary" },
  filterText: { fontSize: "sm", color: "fg", lineHeight: "22px" },
  footerText: { fontSize: "13px", color: "fg.secondary" },
} as const;

const BOOLEAN_LABELS: Record<string, string> = {
  true: "Yes",
  false: "No",
};

const ATTRIBUTE_LABELS: Record<string, string> = {
  "tags_skill.name": "Skill",
  "tags_area.name": "Area",
  "tags_experience.name": "Experience",
  "tags_education.name": "Degree",
  "tags_workload.name": "Role",
  "tags_country.name": "Location",
  "tags_city.name": "Location",
  is_remote: "Remote",
  "org.is_highlighted": "Highlighted",
  "org.name": "Organisation",
  salary_min: "Min Salary",
  posted_at: "Posted",
  posted_at_unix: "Posted",
};
