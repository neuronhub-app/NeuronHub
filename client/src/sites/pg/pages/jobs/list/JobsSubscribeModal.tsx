/**
 * #quality-30% - almost exact duplicate of client/src/apps/jobs/list/JobsSubscribeModal.tsx
 *
 * Only has insignificant CSS changes.
 */
import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { format } from "@neuronhub/shared/utils/format";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { fromUnixTime } from "date-fns";
import { useForm } from "react-hook-form";
import { FaBell } from "react-icons/fa6";
import { useCurrentRefinements } from "react-instantsearch";
import { z } from "zod";
import {
  getLocationIdsActive,
  JobAlertSubscribeMutation,
} from "@/apps/jobs/list/JobsSubscribeModal";
import { useUser } from "@/apps/users/useUserCurrent";
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
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { JobLocationsQuery } from "@/sites/pg/components/PgFacetLocation";
import { useJobListFilters } from "@/sites/pg/pages/jobs/list/jobListFilters";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";

const FormSchema = z.object({
  email: z.email("Invalid email address"),
});

export function JobsSubscribeModal(props: { testId?: string; trigger?: React.ReactNode }) {
  const user = useUser();
  const loading = useIsLoading();

  const refinesCurrent = useCurrentRefinements();
  const { data: locationsData } = useApolloQuery(JobLocationsQuery);

  const state = useStateValtio({ isOpen: false });

  const emailStoreKey = "job_alert_email";
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: user?.email ?? localStorage.getItem(emailStoreKey) ?? "" },
  });

  const jobFilters = useJobListFilters();

  const refinesCurrentReadableMap = [
    ...refinesCurrent.items.flatMap(item =>
      item.refinements.map(refinement => ({
        attribute: ATTRIBUTE_LABELS[item.attribute] ?? item.attribute,
        label: getRefinementLabel(item.attribute, refinement),
      })),
    ),
    ...(jobFilters.snap.salaryMin
      ? [{ attribute: "Minimum Salary", label: `${format.money(jobFilters.snap.salaryMin)}+` }]
      : []),
    ...(jobFilters.snap.excludeNoSalary
      ? [{ attribute: "Exclude No Salary", label: "Yes" }]
      : []),
  ];

  // todo ! refac: duplicate of [[client/src/apps/jobs/list/JobsSubscribeModal.tsx]]
  async function handleSubscribe(fields: z.infer<typeof FormSchema>) {
    const result = await mutateAndRefetchMountedQueries(JobAlertSubscribeMutation, {
      email: fields.email,
      tag_names: refinesCurrent.items
        .filter(item => item.attribute.startsWith("tags_"))
        .flatMap(item => item.refinements.map(tag => String(tag.value))),
      location_ids: getLocationIdsActive(
        refinesCurrent.items,
        locationsData?.job_locations ?? [],
      ),
      is_orgs_highlighted:
        refinesCurrent.items.some(item => item.attribute === "is_orgs_highlighted") || null,
      salary_min: jobFilters.snap.salaryMin ?? null,
      is_exclude_no_salary: jobFilters.snap.excludeNoSalary,
      is_exclude_career_capital:
        refinesCurrent.items.some(item => item.attribute === "is_not_career_capital") || null,
      is_exclude_profit_for_good:
        refinesCurrent.items.some(item => item.attribute === "is_not_profit_for_good") || null,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (result.success) {
      localStorage.setItem(emailStoreKey, fields.email);
      window.dataLayer?.push({ event: "form_submit" });
      toast.success("Subscribed successfully");
      state.mutable.isOpen = false;
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  const hasFilters = refinesCurrentReadableMap.length > 0;

  function openModal() {
    const email = user?.email ?? localStorage.getItem(emailStoreKey) ?? "";
    if (email && !form.getValues("email")) {
      form.setValue("email", email);
    }
    state.mutable.isOpen = true;
  }

  return (
    <>
      {props.trigger ? (
        <Box as="button" onClick={openModal} cursor="pointer" display="inline">
          {props.trigger}
        </Box>
      ) : (
        <Button
          onClick={openModal}
          variant="pg-primary"
          w="full"
          {...(props.testId ? ids.set(props.testId) : {})}
        >
          <Icon boxSize="3.5">
            <FaBell />
          </Icon>
          Get job alerts
        </Button>
      )}

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
          bg="bg"
          fontFamily="body"
          mx="gap.md"
          p={{ base: "gap.md", md: "gap.xl" }}
          maxW={{ md: "536px" }}
        >
          <DialogHeader p="0" mb={hasFilters ? "3" : "gap.lg"}>
            <Stack gap="2.5">
              <DialogTitle {...style.title} pr="10">
                Get job alerts in your inbox
              </DialogTitle>
              <Text {...style.subtitle}>
                Set up filters to receive alerts that match your preferences
              </Text>
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

              <Flex gap="gap.sm">
                <FormChakraInput
                  control={form.control}
                  name="email"
                  placeholder="Enter your email"
                  inputProps={{
                    type: "email",
                    autoFocus: true,
                    bg: "bg.default_real",
                    h: "10",
                    borderRadius: "md",
                    borderWidth: "1px",
                    borderColor: "brand.gray",
                    px: "gap.md",
                    _placeholder: { color: "fg.muted", fontSize: "sm" },
                    _hover: { borderColor: "fg.muted" },
                    _focus: { borderColor: "brand.green.light", boxShadow: "none" },
                    ...ids.set(ids.job.alert.emailInput),
                  }}
                />
                <Button
                  type="submit"
                  variant="pg-primary"
                  loading={loading.isActive}
                  flexShrink="0"
                  {...ids.set(ids.job.alert.submitBtn)}
                >
                  Subscribe
                </Button>
              </Flex>
            </Stack>

            <Stack gap="1">
              <Text {...style.footerText}>
                You will receive updates daily if there are new roles that match your filters.
              </Text>
              <Text {...style.footerText}>You can unsubscribe at any time.</Text>
            </Stack>
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
  if (attribute === "locations.algolia_filter_name") {
    return String(refinement.label).replace(/^\[.+?] /, "");
  }
  return BOOLEAN_LABELS[String(refinement.label)] ?? String(refinement.label);
}

const style = {
  title: { fontFamily: "heading", fontSize: "22px", fontWeight: "medium", color: "fg" },
  subtitle: { fontSize: "md", color: "fg.secondary" },
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
  "tags_country_visa_sponsor.name": "Visa Sponsor",
  "locations.algolia_filter_name": "Location",
  is_orgs_highlighted: "Highlighted",
  is_not_career_capital: "Exclude Career-Capital",
  is_not_profit_for_good: "Exclude Profit for Good",
  "org.name": "Organisation",
  posted_at: "Posted",
  posted_at_unix: "Posted",
};
