/**
 * #AI
 */
import { chakra, SegmentGroup, Stack, Text } from "@chakra-ui/react";

import { NeuronLogo } from "@neuronhub/shared/components/NeuronLogo";

import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { site, siteSlug, type SiteSlug } from "@/layout/siteState";

// Zag treats the falsy "" SiteSlug as "no selection" → invisible active state on load.
const items = [
  { value: siteSlug.nhaAlias, label: "NeuronHub" },
  { value: siteSlug.pg, label: "Probably Good" },
] as const;

export function SiteSwitcher(props: { site: SiteSlug }) {
  return (
    <Stack gap="3" align="stretch" w="100%">
      <SiteLogo site={props.site} />

      <SegmentGroup.Root
        value={props.site === siteSlug.nha ? siteSlug.nhaAlias : props.site}
        onValueChange={details =>
          site.set(details.value === siteSlug.nhaAlias ? siteSlug.nha : siteSlug.pg)
        }
        size="xs"
        w="100%"
      >
        <SegmentGroup.Indicator />

        {items.map(item => (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            flex="1"
            justifyContent="center"
            css={{
              "&[data-state=unchecked]:hover": { bg: "bg.emphasized/60", cursor: "pointer" },
            }}
          >
            <SegmentGroup.ItemText {...ids.set(ids.siteSwitcher.item(item.value))}>
              {item.label}
            </SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
      </SegmentGroup.Root>
    </Stack>
  );
}

function SiteLogo(props: { site: SiteSlug }) {
  if (props.site === "pg") {
    return (
      <chakra.a
        href="https://jobs.probablygood.org/"
        {...ids.set(ids.sidebar.logo)}
        display="flex"
        h="stretch"
        mt="-3px"
        pb="0"
        alignItems="center"
      >
        <Text
          color="gray.800"
          fontSize="24px"
          fontWeight="bold"
          fontFamily="serif"
          lineHeight="1.1"
        >
          Probably{" "}
          <Text as="span" fontWeight="bolder" color="#338050">
            Good
          </Text>
          <Text as="span" fontWeight="bold">
            {" "}
            / Jobs
          </Text>
        </Text>
      </chakra.a>
    );
  }

  return (
    <chakra.a
      href={env.VITE_CLIENT_URL}
      {...ids.set(ids.sidebar.logo)}
      aria-label="NeuronHub"
      display="flex"
    >
      <NeuronLogo breakpoint="2xl" />
    </chakra.a>
  );
}
