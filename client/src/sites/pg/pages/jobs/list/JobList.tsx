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
import { PgFiltersTopbar } from "@/sites/pg/components/PgFiltersTopbar";
import { ContactModal } from "@/sites/pg/pages/jobs/list/ContactModal";
import { FaqModal } from "@/sites/pg/pages/jobs/list/FaqModal";
import { JobCard } from "@/sites/pg/pages/jobs/list/JobCard";
import { JobsSubscribeModal } from "@/sites/pg/pages/jobs/list/JobsSubscribeModal";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList(props: { slug?: string }) {
  const jobOpenPinned = useJobOpenPinned(props.slug);
  const algolia = useAlgoliaSearchClient();

  return (
    <PgAlgoliaList<JobFragmentType>
      index="indexNameJobs"
      label="job"
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
          is_orgs_highlighted: "Highlighted",
          has_salary: "Has Salary",
          is_not_career_capital: "Excl. Career Capital",
          is_not_profit_for_good: "Excl. Profit-for-Good",
          posted_at_unix: "Posted",
          salary_min: "Minimum Salary",
        },
        dateAttributes: ["posted_at_unix"],
        moneyAttributes: ["salary_min"],
      }}
    >
      <Configure
        hitsPerPage={20}
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
        No matching roles
      </Text>

      <Flex align="center" gap="gap.md" direction={{ base: "column", md: "row" }} fontSize="md">
        <Text fontSize="sm" color="fg.muted" flex="1">
          Currently no roles match these filters/search terms. You can{" "}
          <JobsSubscribeModal
            trigger={
              <Text
                as="span"
                fontWeight="bold"
                color="brand.green"
                _hover={{ color: "brand.green.light" }}
              >
                set up an alert
              </Text>
            }
          />{" "}
          to be notified when matching jobs are posted.
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
