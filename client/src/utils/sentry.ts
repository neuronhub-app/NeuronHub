import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

export function initSentryIntegration() {
  Sentry.init({
    dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
    enableLogs: true,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] }),
    ],
    tracePropagationTargets: ["localhost", /^https:\/\/neuronhub\.io\/graphql/],
  });

  return Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);
}
