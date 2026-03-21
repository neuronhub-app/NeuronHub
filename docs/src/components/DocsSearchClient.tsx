/**
 * #AI
 */
"use client";

import { useEffect, useRef } from "react";
import { Box, Dialog, Flex, HStack, Kbd, Input, Portal, Text, chakra } from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp, LuCornerDownLeft } from "react-icons/lu";
import { liteClient } from "algoliasearch/lite";
import { Highlight, InstantSearch, Snippet, useHits, useSearchBox } from "react-instantsearch";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { BadgeNew } from "@/components/BadgeNew";
import { env } from "@/env";
import { ids } from "@/e2e/ids";
import { NavLink, useNavigate } from "react-router";

export function DocsSearchClient() {
  return (
    <InstantSearch searchClient={algoliaClient} indexName={env.VITE_ALGOLIA_INDEX_DOCS}>
      <SearchOverlay />
    </InstantSearch>
  );
}

const algoliaClient = liteClient(
  env.VITE_ALGOLIA_APPLICATION_ID,
  env.VITE_ALGOLIA_SEARCH_API_KEY,
);

function SearchOverlay() {
  const searchBox = useSearchBox();

  const state = useStateValtio({
    isOpen: false,
    activeIndex: 0,
    isMouseNavEnabled: false,
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        state.mutable.isOpen = true;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Why: DocsSearchClient renders alongside the SSR button, not inside it
  useEffect(() => {
    const trigger = document.querySelector(`[data-testid="${ids.search.trigger}"]`);
    if (!trigger) {
      return;
    }
    function onClick(event: Event) {
      event.preventDefault();
      state.mutable.isOpen = true;
    }
    trigger.addEventListener("click", onClick);
    return () => trigger.removeEventListener("click", onClick);
  }, []);

  function handleClose() {
    state.mutable.isOpen = false;
    state.mutable.activeIndex = 0;
    state.mutable.isMouseNavEnabled = false;
    searchBox.refine("");
  }

  return (
    <Dialog.Root
      open={state.snap.isOpen}
      onOpenChange={event => {
        if (!event.open) {
          handleClose();
        }
      }}
      placement="top"
      motionPreset="slide-in-top"
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner pt="5vh">
          <Dialog.Content {...ids.set(ids.search.dialog)} maxH="80vh" bg="bg.muted" shadow="2xl">
            <SearchInput
              query={searchBox.query}
              onQueryChange={value => {
                searchBox.refine(value);
                state.mutable.activeIndex = 0;
                state.mutable.isMouseNavEnabled = false;
              }}
              activeIndex={state.snap.activeIndex}
              onActiveIndexChange={index => {
                state.mutable.activeIndex = index;
                state.mutable.isMouseNavEnabled = false;
              }}
              onClose={handleClose}
            />
            {searchBox.query.length > 0 && (
              <HitsList
                activeIndex={state.snap.activeIndex}
                isMouseNavEnabled={state.snap.isMouseNavEnabled}
                onMouseMove={() => {
                  state.mutable.isMouseNavEnabled = true;
                }}
                onActiveIndexChange={index => {
                  state.mutable.activeIndex = index;
                }}
                onClose={handleClose}
              />
            )}
            <SearchFooter />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function SearchInput(props: {
  query: string;
  onQueryChange: (value: string) => void;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hits = useHits<DocHit>();
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    const count = hits.items.length;
    if (count === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      props.onActiveIndexChange(props.activeIndex < count - 1 ? props.activeIndex + 1 : 0);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      props.onActiveIndexChange(props.activeIndex > 0 ? props.activeIndex - 1 : count - 1);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(hits.items[props.activeIndex]!.url);
      props.onClose();
    }
  }

  return (
    <Box p="3" pt="1" borderBottomWidth="1px">
      <Input
        {...ids.set(ids.search.input)}
        ref={inputRef}
        value={props.query}
        onChange={event => props.onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        size="lg"
        variant="flushed"
        placeholder="Search docs..."
      />
    </Box>
  );
}

function HitsList(props: {
  activeIndex: number;
  isMouseNavEnabled: boolean;
  onMouseMove: () => void;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const hits = useHits<DocHit>();

  if (hits.items.length === 0) {
    return (
      <Box p="6">
        <Text textAlign="center" color="fg.muted" textStyle="sm">
          No results
        </Text>
      </Box>
    );
  }

  return (
    <Box overflowY="auto" maxH="60vh" p="2" onMouseMove={props.onMouseMove}>
      {hits.items.map((hit, index) => (
        <HitItem
          key={hit.objectID}
          hit={hit}
          isActive={index === props.activeIndex}
          onMouseEnter={() => {
            if (props.isMouseNavEnabled) {
              props.onActiveIndexChange(index);
            }
          }}
          onClose={props.onClose}
        />
      ))}
    </Box>
  );
}

// #bad-infer instantsearch.js Hit<BaseHit> not hoisted in Bun workspace — Record<string, any> widens to satisfy Highlight/Snippet
function HitItem(props: {
  hit: DocHit & Record<string, any>;
  isActive: boolean;
  onMouseEnter: () => void;
  onClose: () => void;
}) {
  const isSection = props.hit.heading !== props.hit.pageTitle;
  const isFileNameShown =
    props.hit.fileName.toLowerCase().replace(/[-_]/g, "") !==
    props.hit.pageTitle.toLowerCase().replace(/\s/g, "");

  return (
    <chakra.a
      asChild
      onClick={props.onClose}
      onMouseEnter={props.onMouseEnter}
      display="flex"
      alignItems="center"
      gap="3"
      p="3"
      bg={props.isActive ? "bg.emphasized" : "transparent"}
      rounded="md"
    >
      <NavLink to={props.hit.url}>
        <Box flex="1" minW="0">
          <HStack gap="2" alignItems="baseline">
            <Text fontWeight="medium" textStyle="sm">
              {/* @ts-expect-error #bad-infer instantsearch.js Hit<BaseHit> not hoisted in Bun workspace */}
              <Highlight attribute="pageTitle" hit={props.hit} />
            </Text>

            {props.hit.isNewBadge && <BadgeNew />}

            {isFileNameShown && (
              <Text flexShrink={0} color="fg.subtle" textStyle="xs">
                {props.hit.fileName}
              </Text>
            )}
          </HStack>
          {isSection && (
            <Text mt="0.5" color="fg.muted" textStyle="xs">
              {/* @ts-expect-error #bad-infer instantsearch.js Hit<BaseHit> not hoisted in Bun workspace */}
              <Highlight attribute="heading" hit={props.hit} />
            </Text>
          )}
          {props.hit.content && (
            <Text mt="0.5" color="fg.muted" lineClamp={2} textStyle="xs">
              {/* @ts-expect-error #bad-infer instantsearch.js Hit<BaseHit> not hoisted in Bun workspace */}
              <Snippet attribute="content" hit={props.hit} />
            </Text>
          )}
        </Box>
        <Box flexShrink={0} visibility={props.isActive ? "visible" : "hidden"} color="fg.muted">
          <LuCornerDownLeft size={14} />
        </Box>
      </NavLink>
    </chakra.a>
  );
}

function SearchFooter() {
  return (
    <Flex gap="4" px="4" py="2" borderTopWidth="1px" color="fg.muted" textStyle="xs">
      <HStack gap="1">
        <Kbd size="sm">
          <LuCornerDownLeft size={10} />
        </Kbd>
        <Text>select</Text>
      </HStack>
      <HStack gap="1">
        <Kbd size="sm">
          <LuArrowUp size={10} />
        </Kbd>
        <Kbd size="sm">
          <LuArrowDown size={10} />
        </Kbd>
        <Text>navigate</Text>
      </HStack>
      <HStack gap="1">
        <Kbd size="sm">esc</Kbd>
        <Text>close</Text>
      </HStack>
    </Flex>
  );
}

type DocHit = {
  objectID: string;
  fileName: string;
  pageTitle: string;
  heading: string;
  headingPath: string;
  content: string;
  url: string;
  isNewBadge?: boolean;
};
