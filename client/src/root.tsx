import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Sentry from "@sentry/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { isRouteErrorResponse, Scripts, ScrollRestoration } from "react-router";
import { LayoutContainer } from "@/components/LayoutContainer";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { env } from "@/env";
import { client } from "@/graphql/client";
import { system } from "@/theme/theme";
import type { Route } from "~/react-router/home/+types";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider value={system}>
        <ColorModeProvider enableSystem={true}>
          <LayoutContainer />

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

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />

        {/* favicons */}
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>

      <body>
        {props.children}

        <Scripts />

        <ScrollRestoration />
      </body>
    </html>
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
