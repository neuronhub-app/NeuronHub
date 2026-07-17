/**
 * #AI
 */
"use client";

import { CodeBlock, createShikiAdapter } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { HighlighterGeneric } from "shiki";

export function CodeBlockShikiAdapter(props: { children: ReactNode }) {
  return (
    <CodeBlock.AdapterProvider value={shikiAdapter}>{props.children}</CodeBlock.AdapterProvider>
  );
}

// oxlint-disable-next-line typescript/no-explicit-any
const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: ["yaml", "bash", "typescript", "tsx", "python", "xml"],
      themes: ["github-dark", "github-light"],
    });
  },
  theme: "github-dark",
});
