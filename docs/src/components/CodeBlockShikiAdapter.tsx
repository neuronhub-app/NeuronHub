/**
 * #AI
 */
"use client";

import type { ReactNode } from "react";
import { CodeBlock, createShikiAdapter } from "@chakra-ui/react";
import type { HighlighterGeneric } from "shiki";

export function CodeBlockShikiAdapter(props: { children: ReactNode }) {
  return (
    <CodeBlock.AdapterProvider value={shikiAdapter}>{props.children}</CodeBlock.AdapterProvider>
  );
}

const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: ["yaml", "bash", "typescript", "python"],
      themes: ["github-dark", "github-light"],
    });
  },
  theme: "github-dark",
});
