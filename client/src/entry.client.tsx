import * as Sentry from "@sentry/react-router";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { env } from "@/env";

Sentry.init({
  enabled: env.isProd,
  dsn: env.SENTRY_DSN_FRONTEND,
  integrations: [
    Sentry.reactRouterTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({ colorScheme: "system" }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: env.isProd ? "production" : env.NODE_ENV,
  release: env.VITE_RELEASE_NAME,
  enableLogs: env.isProd,
  // setup API endpoint, see https://docs.sentry.io/platforms/javascript/guides/react-router/troubleshooting/#dealing-with-ad-blockers
  // tunnel: `${env.VITE_SERVER_URL_API}/error-handler`,
  // todo ! IP collection is disabled, but need to add a good Scrubber.
  sendDefaultPii: true,
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
