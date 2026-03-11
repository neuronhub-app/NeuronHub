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
import { JobsSubscribeModal } from "@/apps/jobs/list/JobsSubscribeModal";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { PgAlgoliaList } from "@/sites/pg/components/PgAlgoliaList";
import { PgFiltersTopbar } from "@/sites/pg/components/PgFiltersTopbar";
import { resetSalaryFilter, salaryFilterState } from "@/sites/pg/components/PgFacetSalary";
import { useSnapshot } from "valtio";
import { JobCard } from "@/sites/pg/pages/jobs/list/JobCard";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList(props: { slug?: string }) {
  const jobOpenPinned = useJobOpenPinned(props.slug);
  const algolia = useAlgoliaSearchClient();
  const salarySnap = useSnapshot(salaryFilterState);

  const salaryFilter = salarySnap.excludeNoSalary ? "salary_min > 0" : undefined;
  return (
    <PgAlgoliaList<JobFragmentType>
      index="indexNameJobs"
      label="job"
      cta={
        <JobsSubscribeModal
          buttonProps={{
            variant: "pg-primary",
            w: "full",
            borderRadius: { base: "md", md: "sm" },
            h: "10",
          }}
        />
      }
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
      subheader={
        <Flex gap="gap.md" pr="1" fontSize="xs">
          <Link asChild>
            <NavLink to={urls.jobs.faq}>
              <Icon>
                <GoComment />
              </Icon>
              Contact
            </NavLink>
          </Link>
          <Link asChild>
            <NavLink to={urls.jobs.faq}>
              <Icon>
                <GoQuestion />
              </Icon>
              FAQ
            </NavLink>
          </Link>
        </Flex>
      }
      hits={{
        enrichment: { query: JobsByIdsQuery, extractItems: data => data.jobs },
        renderHit: (job, ctx) => (
          <JobCard key={job.id} job={job} isSearchActive={ctx.isSearchActive} />
        ),
        hitOpenedPinned: jobOpenPinned,
        listTestId: ids.job.list,
        listGap: "gap.md",
      }}
      searchInputTestId={ids.job.searchInput}
      facetsActiveLabelsOverride={{
        is_remote: "Remote",
        "org.is_highlighted": "Highlighted",
        posted_at_unix: "Posted",
        salary_min: "Salary",
      }}
      facetsActiveDateAttributes={["posted_at_unix"]}
      facetsActiveMoneyAttributes={["salary_min"]}
      facetsActiveSubFacetPairs={{ "tags_country_visa_sponsor.name": "tags_country.name" }}
      facetsActiveSubFacetLabel={{
        "tags_country_visa_sponsor.name": "Confirmed can sponsor visas",
      }}
      facetsActiveExtraTags={
        salarySnap.excludeNoSalary
          ? [
              {
                label: "Exclude No Salary Roles",
                onRemove: () => {
                  salaryFilterState.excludeNoSalary = false;
                },
              },
            ]
          : undefined
      }
      facetsTopbar={<PgFiltersTopbar />}
      onClearAdditional={resetSalaryFilter}
    >
      <Configure
        hitsPerPage={20}
        filters={salaryFilter}
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
