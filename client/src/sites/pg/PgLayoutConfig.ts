import type { SystemStyleObject } from "@chakra-ui/react";

export const layout = {
  style: {
    header: {
      paddingX: { base: "50px", md: "58px" },

      get paddingBottom() {
        return { base: this.paddingX.base, md: "20" } as const;
      },
    },

    navbar: {
      paddingX: { base: "30px", md: "10" },
    },

    container: {
      paddingX: { base: "gap.sm", md: "6" },

      paddingBottom: { base: "46px", md: "54px" },
    } satisfies SystemStyleObject,
  },
} as const;
