/**
 * #AI #122
 */
"use client";

import { Box, Stack, Text, chakra } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function Toc() {
  const location = useLocation();
  const items = useHeadingItems(location.pathname);
  const idsVisible = useScrollSpy(items);

  if (items.length === 0) {
    return null;
  }

  function handleClick(id: string) {
    history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  const depthMin = Math.min(...items.map(item => item.depth));

  return (
    <Box as="nav" fontSize="sm">
      <Text fontWeight="semibold">On this page</Text>
      <Stack mt="3" gap="0">
        {items.map(item => (
          <TocLink
            key={item.id}
            css={{ "--toc-depth": item.depth - depthMin }}
            data-current={idsVisible.has(item.id) || undefined}
            onClick={() => handleClick(item.id)}
          >
            {item.text}
          </TocLink>
        ))}
      </Stack>
    </Box>
  );
}

function useHeadingItems(pathname: string): HeadingItem[] {
  const state = useState<HeadingItem[]>([]);

  useEffect(() => {
    const root = document.querySelector("[data-toc-root]");
    if (!root) {
      state[1]([]);
      return;
    }
    const elements = root.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
    state[1](
      Array.from(elements).map(el => ({
        id: el.id,
        text: el.textContent ?? "",
        depth: Number.parseInt(el.tagName[1], 10),
      })),
    );
  }, [pathname]);

  return state[0];
}

function useScrollSpy(items: HeadingItem[]): Set<string> {
  const state = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    function onScroll() {
      const ids = new Set<string>();
      let idLastPastTop = items[0].id;

      for (const item of items) {
        const elem = document.getElementById(item.id);
        if (!elem) {
          continue;
        }
        const top = elem.getBoundingClientRect().top;
        if (top <= 0) {
          idLastPastTop = item.id;
        }
        if (top >= 0 && top < window.innerHeight) {
          ids.add(item.id);
        }
      }

      if (ids.size === 0) {
        ids.add(idLastPastTop);
      }

      state[1](ids);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return state[0];
}

interface HeadingItem {
  id: string;
  text: string;
  depth: number;
}

const TocLink = chakra("a", {
  base: {
    py: "1.5",
    display: "flex",
    textStyle: "sm",
    paddingInlineStart: "calc(var(--toc-depth) * {spacing.5} + {spacing.3})",
    borderStartWidth: "1px",
    borderStartColor: "bg.muted",
    transition: "all 0.15s ease",
    color: "fg.muted",
    textDecoration: "none",
    cursor: "pointer",
    _hover: { color: "fg", borderStartColor: "bg.emphasized" },
    _current: {
      fontWeight: "medium",
      color: "colorPalette.fg",
      borderStartColor: "colorPalette.fg!",
    },
  },
});
