import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useHits, usePagination } from "react-instantsearch";

export function AlgoliaPagination(
  props: {
    count?: number;
    pageSize?: number;
    page?: number;
    onPageChange?: (page: number) => void;
  } = {},
) {
  const hits = useHits();
  const pagination = usePagination();

  const count = props.count ?? pagination.nbHits;

  const onPageChange = props.onPageChange ?? ((page: number) => pagination.refine(page - 1));

  if (count <= 0) {
    return null;
  }

  return (
    <Pagination.Root
      count={count}
      pageSize={props.pageSize ?? hits.results?.hitsPerPage}
      page={props.page ?? pagination.currentRefinement + 1}
      onPageChange={details => onPageChange(details.page)}
      siblingCount={2}
    >
      <ButtonGroup variant="ghost" size="sm" colorPalette="gray">
        <Pagination.PrevTrigger asChild>
          <IconButton>
            <HiChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={page => (
            <IconButton
              key={page.value}
              variant={{ base: "ghost", _selected: "outline" }}
              bg={{ _selected: "bg.panel" }}
              _hover={{ bg: { base: "bg.panel", _selected: "bg.emphasized" } }}
            >
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton>
            <HiChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
}
