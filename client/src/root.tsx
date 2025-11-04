import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Sentry from "@sentry/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { env } from "@/env";
import { client } from "@/graphql/client";
import { system } from "@/theme/theme";
import type { Route } from "~/react-router/home/+types";

export function Layout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NeuronHub</title>
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body>
        {props.children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider value={system}>
        <ColorModeProvider enableSystem={true}>
          <Outlet />
          <Toaster position="bottom-center" gutter={8} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message: string | null = null;
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "Page not found." : error.statusText || details;
  } else if (error && error instanceof Error) {
    // only capture non 404-errors
    Sentry.captureException(error);
    if (env.isDev) {
      details = error.message;
      stack = error.stack;
    }
  }
  return (
    <main>
      {message && <h1>{message}</h1>}
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
