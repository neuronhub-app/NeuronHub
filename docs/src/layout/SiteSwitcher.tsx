/**
 * #AI
 */
import { Button, chakra, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { GoChevronDown } from "react-icons/go";

import { NeuronLogo } from "@neuronhub/shared/components/NeuronLogo";

import { ids } from "@/e2e/ids";
import { env } from "@/env";
import { site, type SiteSlug } from "@/layout/siteState";

const sites = {
  "": "NeuronHub",
  pg: "Probably Good",
} as const;

export function SiteSwitcher(props: { site: SiteSlug }) {
  return (
    <HStack gap="2" align="center" w="100%">
      <SiteLogo site={props.site} />

      <Menu.Root positioning={{ placement: "bottom-start" }}>
        <Menu.Trigger asChild>
          <Button
            {...ids.set(ids.siteSwitcher.trigger)}
            variant="ghost"
            size="xs"
            h="stretch"
            px="0"
            minW="fit-content"
          >
            <GoChevronDown />
          </Button>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="10rem">
              <Menu.RadioItemGroup
                value={props.site}
                onValueChange={details => site.set(details.value as SiteSlug)}
              >
                {Object.entries(sites).map(([value, label]) => (
                  <Menu.RadioItem
                    key={value}
                    {...ids.set(ids.siteSwitcher.item(value))}
                    value={value}
                  >
                    {label}
                    <Menu.ItemIndicator />
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
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
        alignItems="center"
      >
        <Text color="gray.800" fontSize="21px" fontWeight="bold" fontFamily="serif">
          Probably{" "}
          <Text as="span" fontWeight="bolder" color="#338050">
            Good
          </Text>
          <Text as="span" fontWeight="normal">
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
