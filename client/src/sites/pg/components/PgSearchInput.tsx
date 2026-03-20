import { CloseButton, Icon, Input, InputGroup } from "@chakra-ui/react";
import { useRef } from "react";
import { LuSearch } from "react-icons/lu";
import { useSearchBox } from "react-instantsearch";
import { ids } from "@/e2e/ids";

export function PgSearchInput(props: { testId?: string }) {
  const searchBox = useSearchBox();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <InputGroup
      startElement={
        <Icon color="brand.green.light" fontSize={{ base: "xl", md: "2xl" }}>
          <LuSearch />
        </Icon>
      }
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
    >
      <Input
        ref={inputRef}
        value={searchBox.query}
        onChange={event => searchBox.refine(event.target.value)}
        type="search"
        placeholder="Search"
        {...(props.testId ? ids.set(props.testId) : {})}
        bg="white"
        ps={{ base: "10", md: "12" }}
        borderRadius="md"
        borderWidth="1px"
        borderColor="brand.gray"
        _placeholder={{ color: "brand.gray.muted", fontSize: "sm" }}
      />
    </InputGroup>
  );
}
