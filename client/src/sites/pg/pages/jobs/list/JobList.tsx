import { layout } from "@/components/LayoutSidebar";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoBell, GoComment, GoQuestion } from "react-icons/go";
import { Link } from "react-router";
import { Configure, useClearRefinements } from "react-instantsearch";
import { ids } from "@/e2e/ids";
import { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import { graphql, type ID } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { PgAlgoliaList } from "@/sites/pg/components/PgAlgoliaList";
import { format } from "@neuronhub/shared/utils/format";
import { useSnapshot } from "valtio";
import {
  PgFiltersTopbar,
  otherFiltersState,
  resetOtherFilters,
} from "@/sites/pg/components/PgFiltersTopbar";
import { ContactModal } from "@/sites/pg/pages/jobs/list/ContactModal";
import { FaqModal } from "@/sites/pg/pages/jobs/list/FaqModal";
import { JobCard } from "@/sites/pg/pages/jobs/list/JobCard";
import {
  useJobListFilters,
  jobListFiltersUrlParams,
  resetJobListFilters,
} from "@/sites/pg/pages/jobs/list/jobListFilters";
import { JobsSubscribeModal } from "@/sites/pg/pages/jobs/list/JobsSubscribeModal";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList(props: { slug?: string }) {
  const jobOpenPinned = useJobOpenPinned(props.slug);
  const algolia = useAlgoliaSearchClient();
  const filters = useJobListFilters();
  const otherSnap = useSnapshot(otherFiltersState);

  const filterParts: string[] = [];
  if (filters.snap.salaryMin != null && filters.snap.salaryMin > 0) {
    if (filters.snap.excludeNoSalary) {
      filterParts.push(`salary_min >= ${filters.snap.salaryMin}`);
    } else {
      filterParts.push(`(salary_min >= ${filters.snap.salaryMin} OR salary_min = 0)`);
    }
  } else if (filters.snap.excludeNoSalary) {
    filterParts.push("salary_min > 0");
  }
  if (otherSnap.excludeCareerCapital) {
    filterParts.push(`NOT tags_area.name:"Career Capital"`);
  }
  if (otherSnap.excludeProfitForGood) {
    filterParts.push(`NOT tags_area.name:"Profit for Good"`);
  }
  const algoliaFilters = filterParts.join(" AND ");

  const extraTags: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.snap.salaryMin != null && filters.snap.salaryMin > 0) {
    extraTags.push({
      label: `Minimum Salary: ${format.money(filters.snap.salaryMin)}+`,
      onRemove: () => {
        filters.mutable.salaryMin = null;
      },
    });
  }
  if (filters.snap.excludeNoSalary) {
    extraTags.push({
      label: "Exclude No Salary Roles",
      onRemove: () => {
        filters.mutable.excludeNoSalary = false;
      },
    });
  }
  if (otherSnap.excludeCareerCapital) {
    extraTags.push({
      label: "Exclude Career Capital Roles",
      onRemove: () => {
        otherFiltersState.excludeCareerCapital = false;
      },
    });
  }
  if (otherSnap.excludeProfitForGood) {
    extraTags.push({
      label: "Exclude Profit-for-Good Roles",
      onRemove: () => {
        otherFiltersState.excludeProfitForGood = false;
      },
    });
  }
  return (
    <PgAlgoliaList<JobFragmentType>
      index="indexNameJobs"
      label="job"
      urlParams={jobListFiltersUrlParams}
      cta={<JobsSubscribeModal testId={ids.job.alert.subscribeBtn} />}
      ctaMobile={<JobsSubscribeModal testId={ids.job.alert.subscribeBtnMobile} />}
      sort={
        algolia.indexNameJobs && algolia.indexNameJobsSortedByClosesAt
          ? {
              items: [
                { value: algolia.indexNameJobs, label: "Newest" },
                { value: algolia.indexNameJobsSortedByClosesAt, label: "Closing" },
              ],
            }
          : undefined
      }
      subheader={<PgSubheaderLinks />}
      hits={{
        enrichment: { query: JobsByIdsQuery, extractItems: data => data.jobs },
        renderHit: (job, ctx) => (
          <JobCard key={job.id} job={job} isSearchActive={ctx.isSearchActive} />
        ),
        hitOpenedPinned: jobOpenPinned,
        noResultsNode: <JobNoResultsCard />,
        listTestId: ids.job.list,
      }}
      searchInputTestId={ids.job.searchInput}
      facetsTopbar={<PgFiltersTopbar />}
      facetsActive={{
        labelsOverride: {
          "org.is_highlighted": "Highlighted",
          posted_at_unix: "Posted",
        },
        dateAttributes: ["posted_at_unix"],
        extraTags,
        onClearAdditional: () => {
          resetJobListFilters();
          resetOtherFilters();
        },
      }}
    >
      <Configure
        hitsPerPage={20}
        filters={algoliaFilters}
        attributesToHighlight={[
          "title",
          "org.name",
          "locations.country",
          "locations.city",
          "tags_skill.name",
          "tags_area.name",
          "description",
        ]}
        attributesToSnippet={["description:30"]}
      />
    </PgAlgoliaList>
  );
}

function JobNoResultsCard() {
  return (
    <Stack
      p={{ base: "gap.sm", md: "gap.lg" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="subtle"
      bg="bg.card"
      gap="gap.sm"
    >
      <Text fontWeight="semibold" color="fg" textAlign="center">
        No jobs found
      </Text>

      <Flex align="center" gap="gap.md" direction={{ base: "column", md: "row" }} fontSize="md">
        <Text fontSize="sm" color="fg.muted" flex="1">
          No jobs match this combination of filters right now.{" "}
          <JobsSubscribeModal
            trigger={
              <Text
                as="span"
                fontWeight="bold"
                color="brand.green"
                _hover={{ color: "brand.green.light" }}
              >
                Set a job alert
              </Text>
            }
          />{" "}
          to be notified when matching roles are posted.
        </Text>

        <ResetFiltersButton />
      </Flex>
    </Stack>
  );
}

function ResetFiltersButton() {
  const clear = useClearRefinements();

  if (!clear.canRefine) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        clear.refine();
        resetJobListFilters();
        resetOtherFilters();
      }}
      flexShrink="0"
    >
      Reset filters
    </Button>
  );
}

function useJobOpenPinned(slug?: string): { node?: ReactNode; id?: ID } {
  const isNotNeeded = !slug;

  const query = useApolloQuery(JobBySlugQuery, { slug: slug ?? "" }, { skip: isNotNeeded });

  const isLoading = query.isLoadingFirstTime || query.loading;

  const job = query.data?.job_by_slug;

  if (isNotNeeded) {
    return {};
  }

  const isNotFound = !isLoading && !job;
  if (isNotFound) {
    return {
      id: undefined,
      node: (
        <Box>
          <Stack
            as="article"
            p={{ base: "gap.md", md: "gap.xl" }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="subtle"
            bg="bg.card"
            align="center"
          >
            <Text fontWeight="semibold" color="fg">
              Job not found
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Job matching "/{slug}" was not found.
            </Text>
          </Stack>
          <JobOpenSeparator />
        </Box>
      ),
    };
  }

  return {
    id: job?.id,
    node: (
      <Box position="relative">
        {isLoading ? (
          <Skeleton h="32" w="full" />
        ) : (
          <JobCard job={job!} isSearchActive={false} isInitiallyOpen={true} />
        )}

        <JobOpenSeparator />
      </Box>
    ),
  };
}

function JobOpenSeparator() {
  return (
    <HStack mt="gap.xl">
      <Separator flex="1" borderColor="brand.gray" />
      <Text color="brand.gray.muted" fontSize="sm" fontWeight="medium">
        All jobs
      </Text>
      <Separator flex="1" borderColor="brand.gray" />
    </HStack>
  );
}

function PgSubheaderLinks() {
  const { data } = useApolloQuery(JobAlertListQuery);
  const alertsCount = data?.job_alerts?.length ?? 0;

  return (
    <Flex gap="gap.lg">
      {alertsCount > 0 && (
        <Button variant="plain" {...pgSubheaderButtonStyle} asChild>
          <Link to={urls.jobs.subscriptions}>
            <Icon>
              <GoBell />
            </Icon>
            Your {layout.label.jobAlerts(alertsCount)}
          </Link>
        </Button>
      )}
      <FaqModal>
        <Button variant="plain" {...pgSubheaderButtonStyle}>
          <Icon>
            <GoQuestion />
          </Icon>
          FAQ
        </Button>
      </FaqModal>
      <ContactModal>
        <Button variant="plain" {...pgSubheaderButtonStyle}>
          <Icon>
            <GoComment />
          </Icon>
          Contact
        </Button>
      </ContactModal>
    </Flex>
  );
}

const pgSubheaderButtonStyle = {
  fontWeight: "medium",
  fontSize: "sm",
  color: "brand.green",
  p: "0",
  h: "auto",
  _hover: { color: "brand.green.light" },
} as const;

const JobsByIdsQuery = graphql.persisted(
  "JobsByIds",
  graphql(
    `query JobsByIds($ids: [ID!]!) {
      jobs(filters: { id: { in_list: $ids } }) {
        ...JobFragment
      }
    }`,
    [JobFragment],
  ),
);

const JobBySlugQuery = graphql.persisted(
  "JobBySlug",
  graphql(
    `query JobBySlug($slug: String!) {
      job_by_slug(slug: $slug) {
        ...JobFragment
      }
    }`,
    [JobFragment],
  ),
);
