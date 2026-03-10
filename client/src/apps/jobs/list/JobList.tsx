import {
  Box,
  Code,
  Flex,
  HStack,
  Icon,
  Link,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { GoComment, GoQuestion } from "react-icons/go";
import { Configure } from "react-instantsearch";
import { NavLink } from "react-router";

import { JobCard } from "@/apps/jobs/list/JobCard/JobCard";
import { JobsSubscribeModal } from "@/apps/jobs/list/JobsSubscribeModal";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
import { AlgoliaFacetSalary } from "@/components/algolia/AlgoliaFacetSalary";
import { AlgoliaFacetsActive } from "@/components/algolia/AlgoliaFacetsActive";
import { AlgoliaList } from "@/components/algolia/AlgoliaList";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { JobFragment, type JobFragmentType } from "@/graphql/fragments/jobs";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList(props: { slug?: string }) {
  const jobOpenPinned = useJobOpenPinned(props.slug);

  const algolia = useAlgoliaSearchClient();

  return (
    <AlgoliaList<JobFragmentType>
      index="indexNameJobs"
      label="job"
      cta={<JobsSubscribeModal />}
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
      }}
      searchInputTestId={ids.job.searchInput}
    >
      <Configure
        hitsPerPage={20}
        attributesToHighlight={[
          "title",
          "org.name",
          "tags_country.name",
          "tags_city.name",
          "tags_skill.name",
          "tags_area.name",
        ]}
      />

      <AlgoliaFacetsActive
        labelsOverride={{
          is_remote: "Remote",
          "org.is_highlighted": "Highlighted",
          posted_at_unix: "Posted",
          salary_min: "Salary",
        }}
        dateAttributes={["posted_at_unix"]}
      />

      <Stack gap="1">
        <AlgoliaFacetBoolean attribute="is_remote" label="Remote" />
        <AlgoliaFacetBoolean attribute="org.is_highlighted" label="Highlighted Organizations" />
      </Stack>

      <AlgoliaFacetAttribute attribute="tags_experience.name" label="Experience" />
      <AlgoliaFacetAttribute
        attribute="tags_country.name"
        label="Country"
        isSearchEnabled
        showFirst={5}
        subFacet={{
          attribute: "tags_country_visa_sponsor.name",
          label: "Visa sponsorship",
        }}
      />
      <AlgoliaFacetAttribute
        attribute="tags_city.name"
        label="City"
        isSearchEnabled
        showFirst={5}
      />
      <AlgoliaFacetSalary attribute="salary_min" label="Salary" />
      <AlgoliaFacetAttribute
        attribute="tags_skill.name"
        label="Skills"
        isSearchEnabled
        showFirst={7}
      />
      <AlgoliaFacetAttribute attribute="tags_area.name" label="Area" />
      <AlgoliaFacetAttribute attribute="tags_workload.name" label="Workload" />
      <AlgoliaFacetDate attribute="posted_at_unix" label="Posted" />
      <AlgoliaFacetAttribute attribute="tags_education.name" label="Education" />
      <AlgoliaFacetAttribute attribute="org.name" label="Organization" isSearchEnabled />
    </AlgoliaList>
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
      <Text flexShrink="0" color="fg.subtle" fontSize="sm">
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
