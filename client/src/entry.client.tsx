import { StrictMode, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { env } from "@/env";
import {
  Routes,
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";
import * as Sentry from "@sentry/react";

Sentry.init({
  enabled: env.isProd,
  dsn: env.VITE_SENTRY_DSN_FRONTEND,
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.graphqlClientIntegration({ endpoints: [env.VITE_SERVER_URL_API] }),
    Sentry.replayIntegration(),
    // Sentry.feedbackIntegration({ colorScheme: "system" }),
    Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: env.isProd ? "production" : env.NODE_ENV,
  release: env.VITE_RELEASE_NAME,
  enableLogs: env.isProd,
  // setup API endpoint, see https://docs.sentry.io/platforms/javascript/guides/react-router/troubleshooting/#dealing-with-ad-blockers
  // tunnel: `${env.VITE_SERVER_URL_API}/error-handler`,
  // todo ! privacy: IP collection is disabled, but need to add a good Scrubber.
  sendDefaultPii: true,
});

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);
const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
