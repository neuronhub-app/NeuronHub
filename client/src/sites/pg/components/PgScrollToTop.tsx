import { useEffect, useRef } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

const containerHalfWithGap = 551;

const style = {
  button: {
    pos: "fixed",
    zIndex: "sticky",
    bottom: { base: "gap.sm", lg: "gap.md" },
    right: { base: "gap.sm", md: "6", xl: `calc(50% - ${containerHalfWithGap}px)` },
    w: "10",
    h: "10",
    borderWidth: "1px",
    borderColor: "subtle",
    transition: "opacity 0.2s, border-color 0.3s",
    bg: "bg.card",
    borderRadius: "full",
    cursor: "pointer",
    color: "fg",
    _hover: { borderColor: "brand.black" },
  },
} as const;

export function PgScrollToTop() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const state = useStateValtio({ isVisible: false });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      state.mutable.isVisible = !entry!.isIntersecting;
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box ref={sentinelRef} pos="absolute" top="0" left="0" h="1px" />
      <IconButton
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        variant="plain"
        {...style.button}
        opacity={state.snap.isVisible ? 1 : 0}
        pointerEvents={state.snap.isVisible ? "auto" : "none"}
      >
        <LuArrowUp />
      </IconButton>
    </>
  );
}
