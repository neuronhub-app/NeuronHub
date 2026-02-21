import { CloseButton, Input, InputGroup } from "@chakra-ui/react";
import { useRef } from "react";
import { LuSearch } from "react-icons/lu";
import { useSearchBox } from "react-instantsearch";
import { ids } from "@/e2e/ids";

export function AlgoliaSearchInput(props: { testId?: string }) {
  const searchBox = useSearchBox();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <InputGroup
      startElement={<LuSearch />}
      endElement={
        searchBox.query ? (
          <CloseButton
            size="xs"
            onClick={() => {
              searchBox.refine("");
              inputRef.current?.focus();
            }}
            me="-2"
          />
        ) : null
      }
      w="lg"
    >
      <Input
        ref={inputRef}
        value={searchBox.query}
        onChange={event => searchBox.refine(event.target.value)}
        type="search"
        placeholder="Search"
        {...(props.testId ? ids.set(props.testId) : {})}
        bg="bg.panel"
        borderRadius="md"
        border="1px solid"
        borderColor="inherit"
        _hover={{
          borderColor: "border.emphasized",
        }}
      />
    </InputGroup>
  );
}
