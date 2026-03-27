import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoComment, GoQuestion } from "react-icons/go";
import { Configure } from "react-instantsearch";
import { useSnapshot } from "valtio";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { PgAlgoliaList } from "@/sites/pg/components/PgAlgoliaList";
import { resetSalaryFilter, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import {
  otherFiltersState,
  PgFiltersTopbar,
  resetOtherFilters,
} from "@/sites/pg/components/PgFiltersTopbar";
import { ContactModal } from "@/sites/pg/pages/jobs/list/ContactModal";
import { FaqModal } from "@/sites/pg/pages/jobs/list/FaqModal";
import { JobCard } from "@/sites/pg/pages/jobs/list/JobCard";
import { JobsSubscribeModal } from "@/sites/pg/pages/jobs/list/JobsSubscribeModal";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList(props: { slug?: string }) {
  const jobOpenPinned = useJobOpenPinned(props.slug);
  const algolia = useAlgoliaSearchClient();
  const salarySnap = useSnapshot(salaryFilterState);
  const otherSnap = useSnapshot(otherFiltersState);

  const filterParts: string[] = [];
  if (salarySnap.excludeNoSalary) {
    filterParts.push("salary_min > 0");
  }
  if (otherSnap.excludeCareerCapital) {
    filterParts.push(`NOT tags_area.name:"Career Capital"`);
  }
  if (otherSnap.excludeProfitForGood) {
    filterParts.push(`NOT tags_area.name:"Profit for Good"`);
  }
  const filters = filterParts.length > 0 ? filterParts.join(" AND ") : undefined;

  const extraTags: Array<{ label: string; onRemove: () => void }> = [];
  if (salarySnap.excludeNoSalary) {
    extraTags.push({
      label: "Exclude No Salary Roles",
      onRemove: () => {
        salaryFilterState.excludeNoSalary = false;
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
          is_remote: "Remote",
          "org.is_highlighted": "Highlighted",
          posted_at_unix: "Posted",
          salary_min: "Minimum Salary",
        },
        dateAttributes: ["posted_at_unix"],
        moneyAttributes: ["salary_min"],
        extraTags,
        onClearAdditional: () => {
          resetSalaryFilter();
          resetOtherFilters();
        },
      }}
    >
      <Configure
        hitsPerPage={20}
        filters={filters}
        attributesToHighlight={[
          "title",
          "org.name",
          "tags_country.name",
          "tags_city.name",
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
      p={{ base: "gap.sm", md: "gap.md" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="subtle"
      bg="bg.card"
      gap="gap.md"
    >
      <Text fontWeight="semibold" color="fg" textAlign="center">
        No jobs found
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap="gap.md">
        <Box gridColumn={{ md: "span 4" }}>
          <Text fontSize="sm" color="fg.muted">
            No jobs match this combination of filters right now, but you can set a job alert so
            you'll know as soon as any matching roles are posted.
          </Text>
        </Box>
        <Box>
          <JobsSubscribeModal />
        </Box>
      </Grid>
    </Stack>
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
  return (
    <Flex gap="gap.lg">
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
