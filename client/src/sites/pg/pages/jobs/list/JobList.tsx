import {
  Box,
  Code,
  Flex,
  HStack,
  Icon,
  Link,
  Separator,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoComment, GoQuestion } from "react-icons/go";
import { Configure } from "react-instantsearch";
import { NavLink } from "react-router";
import { JobsSubscribeModal } from "@/sites/pg/pages/jobs/list/JobsSubscribeModal";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { PgAlgoliaList } from "@/sites/pg/components/PgAlgoliaList";
import {
  PgFiltersTopbar,
  otherFiltersState,
  resetOtherFilters,
} from "@/sites/pg/components/PgFiltersTopbar";
import { resetSalaryFilter, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import { useSnapshot } from "valtio";
import { JobCard } from "@/sites/pg/pages/jobs/list/JobCard";
import { urls } from "@/urls";
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
        listTestId: ids.job.list,
      }}
      searchInputTestId={ids.job.searchInput}
      facetsActiveLabelsOverride={{
        is_remote: "Remote",
        "org.is_highlighted": "Highlighted",
        posted_at_unix: "Posted",
        salary_min: "Minimum Salary",
      }}
      facetsActiveDateAttributes={["posted_at_unix"]}
      facetsActiveMoneyAttributes={["salary_min"]}
      facetsActiveExtraTags={extraTags}
      facetsTopbar={<PgFiltersTopbar />}
      onClearAdditional={() => {
        resetSalaryFilter();
        resetOtherFilters();
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
          <Text>
            Job not found: <Code>{slug}</Code>
          </Text>
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
          <JobCard job={job!} isSearchActive={false} />
        )}

        <JobOpenSeparator />
      </Box>
    ),
  };
}

function JobOpenSeparator() {
  return (
    <HStack mt="gap.md2">
      <Separator flex="1" />
      <Text flexShrink="0" color="fg.muted" fontSize="sm">
        All jobs
      </Text>
      <Separator flex="1" />
    </HStack>
  );
}

function PgSubheaderLinks() {
  return (
    <Flex gap="gap.lg">
      <Link asChild {...pgSubheaderLinkStyle}>
        <NavLink to={urls.jobs.faq}>
          <Icon>
            <GoQuestion />
          </Icon>
          FAQ
        </NavLink>
      </Link>
      <Link href="https://probablygood.org/contact/" {...pgSubheaderLinkStyle}>
        <Icon>
          <GoComment />
        </Icon>
        Contact
      </Link>
    </Flex>
  );
}

const pgSubheaderLinkStyle = {
  fontWeight: "medium",
  fontSize: "sm",
  color: "brand.green",
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
