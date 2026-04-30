import { ApolloProvider } from "@apollo/client/react";
import { Box, ChakraProvider } from "@chakra-ui/react";
import * as Sentry from "@sentry/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet, Scripts, ScrollRestoration } from "react-router";
import { AdminMenuFloatButton } from "@/components/AdminMenuFloatButton";
import { ErrorState } from "@/components/ErrorState";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { Toaster as ChakraToaster } from "@/components/ui/toaster";
import { useMetaTitle } from "@/components/useMetaTitle";
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

          <AdminMenuFloatButton isThemeSwitcher={env.site.isProbablyGood} />
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
        {env.VITE_GTM_ID && <GtmNoscript gtmId={env.VITE_GTM_ID} />}

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

      {env.VITE_GTM_ID && <GtmHead gtmId={env.VITE_GTM_ID} />}

      {!env.isProd && <meta name="robots" content="noindex, follow" />}

      <meta name="color-scheme" content={siteConfig.forcedColorMode ?? "light dark"} />

      {siteConfig.meta && (
        <>
          <meta name="description" content={siteConfig.meta.description} />
          <meta property="og:title" content={siteConfig.meta.title} />
          <meta property="og:description" content={siteConfig.meta.description} />
          <meta property="og:type" content="website" />
          {siteConfig.meta.ogImage && (
            <meta property="og:image" content={siteConfig.meta.ogImage} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={siteConfig.meta.title} />
          <meta name="twitter:description" content={siteConfig.meta.description} />
          {siteConfig.meta.ogImage && (
            <meta name="twitter:image" content={siteConfig.meta.ogImage} />
          )}
        </>
      )}

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

function GtmHead(props: { gtmId: string }) {
  const trafficType = env.isProd ? "" : "internal";
  const initScript = `
window.dataLayer=window.dataLayer||[];
${trafficType ? `window.dataLayer.push({traffic_type:'${trafficType}'});` : ""}
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${props.gtmId}');`;

  return <script dangerouslySetInnerHTML={{ __html: initScript }} />;
}

function GtmNoscript(props: { gtmId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${props.gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="GTM"
      />
    </noscript>
  );
}

export function ErrorBoundary(props?: Route.ErrorBoundaryProps) {
  const isNotFound = props?.error instanceof Error && props?.error.name === ErrorNotFound.name;

  if (!isNotFound && props?.error instanceof Error) {
    Sentry.captureException(props.error);
  }

  const devCallStack =
    env.isDev && props?.error instanceof Error ? props?.error.stack : undefined;
  const devErrorMsg =
    env.isDev && props?.error instanceof Error ? props?.error.message : undefined;

  return (
    <AppProviders>
      {isNotFound ? (
        <ErrorState
          title="404 - Page not found"
          description="The page you're looking for doesn't exist or was moved."
        />
      ) : (
        <ErrorState description={devErrorMsg} />
      )}
      {devCallStack && (
        <Box
          as="pre"
          mx="auto"
          maxW="3xl"
          px="gap.md"
          fontSize="xs"
          overflow="auto"
          whiteSpace="pre-wrap"
          color="fg.muted"
        >
          {devCallStack}
        </Box>
      )}
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
