import { Flex, FormatNumber, SkeletonText, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useStats } from "react-instantsearch";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

// #AI
export function PgAlgoliaSearchStats(props: { label: string; indexName: string }) {
  const algolia = useAlgoliaSearchClient();
  const stats = useStats();

  const state = useStateValtio({
    total: 0,
  });

  useEffect(() => {
    if (!algolia.client) {
      return;
    }
    algolia.client
      .search([{ indexName: props.indexName, params: { query: "", hitsPerPage: 0 } }])
      .then(response => {
        state.mutable.total = (response.results[0] as { nbHits: number }).nbHits;
      });
  }, [algolia.client, props.indexName]);

  // #AI
  const isFirstSearchPending = stats.nbHits === 0 && stats.processingTimeMS === 0;

  const SkeletonText4 = <SkeletonText noOfLines={1} w={{ base: "30px", md: "35.5px" }} />;

  return (
    <Flex
      gap="1"
      align="center"
      fontSize={{ base: "xs", lg: "sm" }}
      color="brand.gray.muted"
      whiteSpace="nowrap"
    >
      {isFirstSearchPending ? SkeletonText4 : <FormatNumber value={stats.nbHits} />}
      {state.snap.total ? (
        <Flex gap="1">
          <Text>/</Text>
          <FormatNumber value={state.snap.total} />
        </Flex>
      ) : (
        SkeletonText4
      )}
      <Text hideBelow="md">{props.label}</Text>
    </Flex>
  );
}
