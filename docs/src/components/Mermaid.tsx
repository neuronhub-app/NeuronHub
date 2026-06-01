"use client";

import { Box } from "@chakra-ui/react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export function Mermaid(props: { chart: string }) {
  const colorMode = useTheme();
  // Box has no children - React must not manage the node so mermaid's injected
  // SVG survives parent re-renders; the effect re-runs only on chart/theme change.
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    mermaid.initialize({
      startOnLoad: false,
      theme: colorMode.resolvedTheme === "dark" ? "dark" : "default",
    });
    node.removeAttribute("data-processed");
    node.textContent = props.chart;
    void mermaid.run({ nodes: [node] });
  }, [props.chart, colorMode.resolvedTheme]);

  return <Box ref={ref} overflowX="auto" css={{ "& svg": { maxW: "full", h: "auto" } }} />;
}
