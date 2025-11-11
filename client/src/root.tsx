import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Sentry from "@sentry/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Scripts, ScrollRestoration } from "react-router";
import { LayoutContainer } from "@/components/LayoutContainer";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { env } from "@/env";
import { client } from "@/graphql/client";
import { system } from "@/theme/theme";
import type { Route } from "~/react-router/home/+types";

export default function App() {
  return (
    <AppProviders>
      <LayoutContainer />
    </AppProviders>
  );
}

function AppProviders(props: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider value={system}>
        <ColorModeProvider enableSystem={true}>
          {props.children}

          <Toaster position="bottom-center" gutter={8} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export function Layout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>NeuronHub</title>
        <LayoutHead />
      </head>

      <body>
        {props.children}

        <Scripts />

        <ScrollRestoration />
      </body>
    </html>
  );
}

function LayoutHead() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light dark" />

      {/* favicons */}
      <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
      <link rel="manifest" href="/favicon/site.webmanifest" />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message: string | null = null;
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (error instanceof Error) {
    if (error.message === ErrorNotFound.message) {
      message = "404";
      details = "Page not found.";
    } else {
      Sentry.captureException(error);
      if (env.isDev) {
        details = error.message;
        stack = error.stack;
      }
    }
  }

  return (
    <AppProviders>
      <LayoutContainer>
        {message && <h1>{message}</h1>}
        <p>{details}</p>
        {stack && (
          <pre>
            <code>{stack}</code>
          </pre>
        )}
      </LayoutContainer>
    </AppProviders>
  );
}

export class ErrorNotFound extends Error {
  static message = "Page not found";
}
