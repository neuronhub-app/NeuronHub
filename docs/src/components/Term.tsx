"use client";

import { PageLink } from "@/components/PageLink";
import { Code, CodeProps, Popover, Portal, Text, VStack } from "@chakra-ui/react";
import { theme } from "@neuronhub/shared/theme/colors";
import { type ReactNode, createContext, useContext } from "react";

import { ReactRouterPath } from "@/utils/types";
import { ids } from "@/e2e/ids";
import { LinkExt } from "@/components/LinkExt";
import { LinkInt } from "@/components/LinkInt";

export type TermId = keyof typeof glossary;

export function Term(props: { id: TermId }) {
  const depth = useContext(TermDepthContext);

  const term = glossary[props.id];

  const isTermInTerm = depth > 0;

  const isDumbPopoverDepth = depth > 2;
  if (isDumbPopoverDepth) {
    return <Code {...style.code({ isTermInTerm })}>{term.label}</Code>;
  }

  return (
    <TermDepthContext value={depth + 1}>
      <Popover.Root
        size="lg"
        lazyMount
        unmountOnExit
        positioning={{ placement: "top" }}
        autoFocus={false}
        // open={props.id === "algolia"}
      >
        <Popover.Trigger asChild>
          <Code {...style.code({ isTermInTerm })} {...ids.set(ids.term.trigger)}>
            {term.label}
          </Code>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content w="lg">
              <Popover.Arrow />
              <Popover.Body p="gap.md">
                <TermHelpText help={term.help} />
              </Popover.Body>

              {term.pagePath && (
                <Popover.Footer
                  w="full"
                  display="flex"
                  justifyContent="end"
                  py="2"
                  px="4"
                  borderTopWidth="1px"
                >
                  <LinkInt path={term.pagePath}>Read more →</LinkInt>
                </Popover.Footer>
              )}
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </TermDepthContext>
  );
}

const TermDepthContext = createContext(0);

// Deferring props.help() and Popover.lazyMount stops SSR recursion (eg if id="backend" ↔ id="frontend")
function TermHelpText(props: { help: () => ReactNode }) {
  return props.help();
}

const glossary = {
  backend: {
    label: "Backend",
    help: () => (
      <TermHelp>
        <Text>
          The web service hosted on <LinkInt path="/usage/guides/render">Render</LinkInt> (eg at{" "}
          <Code>{urls.backend}</Code>). <Term id="frontend" /> uses its API.
        </Text>

        <Text>
          Built on <LinkExt href="https://djangoproject.com">Django Framework</LinkExt>.
        </Text>
      </TermHelp>
    ),
    pagePath: undefined,
  },
  frontend: {
    label: "Frontend",
    help: () => (
      <TermHelp>
        <Text>
          The static website hosted on <LinkInt path="/usage/guides/render">Render</LinkInt> (eg
          at <Code>{urls.frontend}</Code>). Uses the API of <Term id="backend" />.
        </Text>

        <Text>
          Built on <LinkExt href="https://reactrouter.com">React Router Framework</LinkExt>.
        </Text>
      </TermHelp>
    ),
    pagePath: undefined,
  },
  algolia: {
    label: "Algolia",
    pagePath: "/usage/guides/algolia",
    help: () => (
      <TermHelp>
        <Text>
          <LinkExt href="https://algolia.com">Algolia.com</LinkExt> search engine that's used for
          all list pages (<Code>/jobs</Code>, <Code>/profiles</Code>, <Code>/posts</Code>).
        </Text>
      </TermHelp>
    ),
  },
  sentry: {
    label: "Sentry",
    pagePath: "/usage/guides/sentry",
    help: () => <TermHelp>Error tracking and performance monitoring service.</TermHelp>,
  },
  worker: {
    label: "Background Worker",
    help: () => (
      <TermHelp>
        <Text>
          The backend background worker hosted on{" "}
          <LinkInt path="/usage/guides/render">Render</LinkInt>. <Term id="backend" /> uses it to
          execute schedule-based or time-consuming tasks, eg sending emails to users (see details
          in <PageLink id="job-alert-emails" />
          ).
        </Text>
      </TermHelp>
    ),
    pagePath: undefined,
  },
  user: {
    label: "User",
    pagePath: "/usage/reference/database-tables/user",
    help: () => <TermHelp>Admin user account for managing the platform.</TermHelp>,
  },
  mise: {
    label: "Mise",
    pagePath: "/development/intro/mise-taskfile",
    help: () => (
      <TermHelp>
        <Text>Task runner and env manager. All dev commands run through it.</Text>
        <Text>
          See <LinkExt href="https://mise.jdx.dev">mise.jdx.dev</LinkExt>
        </Text>
      </TermHelp>
    ),
  },
} as const satisfies Record<
  string,
  { label: string; help: () => ReactNode; pagePath?: ReactRouterPath }
>;

function TermHelp(props: { children: ReactNode }) {
  return (
    <VStack gap="gap.sm2" align="flex-start" fontSize={style.fontSize}>
      {props.children}
    </VStack>
  );
}

const urls = {
  frontend: "https://jobs.probablygood.org",
  backend: "https://backend.jobs.probablygood.org",
} as const;

const style = {
  fontSize: "xs",
  code(opts = { isTermInTerm: false }): CodeProps {
    return {
      fontSize: opts.isTermInTerm ? this.fontSize : "",
      cursor: "help",
      colorPalette: theme.colorSecondary,
      bg: "colorPalette.subtle",
      transition: "background",
      transitionDuration: "fast",
      _hover: {
        bg: "colorPalette.subtle/70",
      },
    };
  },
};
