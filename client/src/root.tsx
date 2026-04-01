import { ApolloProvider } from "@apollo/client/react";
import { ChakraProvider } from "@chakra-ui/react";
import * as Sentry from "@sentry/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Toaster as ChakraToaster } from "@/components/ui/toaster";
import { Outlet, Scripts, ScrollRestoration } from "react-router";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { useMetaTitle } from "@/components/useMetaTitle";
import { AdminMenuFloatButton } from "@/components/AdminMenuFloatButton";
import { env } from "@/env";
import { client } from "@/graphql/client";
import { siteConfig } from "@/sites";
import type { Route } from "./+types/root";

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

function AppProviders(props: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider value={siteConfig.theme}>
        <ColorModeProvider
          enableSystem={env.isTiredOwlDev ? true : !siteConfig.forcedColorMode}
          forcedTheme={env.isTiredOwlDev ? undefined : siteConfig.forcedColorMode}
        >
          {props.children}

          <Toaster position="bottom-center" gutter={8} />
          <ChakraToaster />

          <AdminMenuFloatButton isThemeSwitcher={env.VITE_SITE === "pg"} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export function Layout(props: { children: ReactNode }) {
  const title = useMetaTitle();

  return (
    <html lang="en">
      <head>
        <title>{title.value}</title>
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
      <meta name="color-scheme" content={siteConfig.forcedColorMode ?? "light dark"} />

      {siteConfig.googleFontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={siteConfig.googleFontsHref} />
        </>
      )}

      {/* favicons */}
      <link rel="icon" type="image/svg+xml" href={siteConfig.favicon.svg} />
      <link rel="icon" type="image/png" href={siteConfig.favicon.png96} sizes="96x96" />
      <link rel="shortcut icon" href={siteConfig.favicon.ico} />
      <link rel="apple-touch-icon" href={siteConfig.favicon.appleTouchIcon} sizes="180x180" />
      <link rel="manifest" href={siteConfig.favicon.webmanifest} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message: string | null = null;
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (error instanceof Error) {
    if (error.name === ErrorNotFound.name) {
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
      <main style={{ padding: "2rem" }}>
        {message && <h1>{message}</h1>}
        <p>{details}</p>
        {stack && (
          <pre>
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </AppProviders>
  );
}

export class ErrorNotFound extends Error {
  static message = "Page not found";
  constructor(name = "ErrorNotFound") {
    super();
    this.name = name;
  }
}
