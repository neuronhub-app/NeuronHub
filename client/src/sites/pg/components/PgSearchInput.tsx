import { CloseButton, Flex, Icon, Input, InputGroup, Collapsible } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";
import { LuSearch } from "react-icons/lu";
import { useSearchBox } from "react-instantsearch";
import { ids } from "@/e2e/ids";

export function PgSearchInput(props: { endElementText: ReactNode; testId?: string }) {
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
        <Flex align="center" gap="1">
          {props.endElementText}

          <Collapsible.Root open={Boolean(searchBox.query)} lazyMount>
            <Collapsible.Content
              _open={{
                animationName: "expand-width, fade-in",
              }}
              _closed={{
                animationName: "collapse-width, fade-in",
              }}
            >
              <CloseButton
                size="xs"
                onClick={() => {
                  searchBox.refine("");
                  inputRef.current?.focus();
                }}
              />
            </Collapsible.Content>
          </Collapsible.Root>
        </Flex>
      }
    >
      <Input
        ref={inputRef}
        value={searchBox.query}
        onChange={event => searchBox.refine(event.target.value)}
        type="search"
        placeholder="Search"
        {...(props.testId ? ids.set(props.testId) : {})}
        bg="bg.default_real"
        ps={{ base: "10", md: "12" }}
        borderRadius="md"
        borderWidth="1px"
        borderColor="brand.gray"
        _hover={{ borderColor: "fg.muted" }}
        _placeholder={{ color: "brand.gray.muted", fontSize: "sm" }}
      />
    </InputGroup>
  );
}
