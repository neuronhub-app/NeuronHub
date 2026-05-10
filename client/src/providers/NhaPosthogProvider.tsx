/**
 * todo ? refac: don't have a folder with a single Comp. Move it up, or place more Providers in this dir.
 */
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { env } from "@/env";
import { ReactNode } from "react";

export function NhaPosthogProvider(props: { children: ReactNode }) {
  if (env.VITE_POSTHOG_IS_ENABLED) {
    posthog.init(env.VITE_POSTHOG_TOKEN, {
      api_host: env.VITE_POSTHOG_HOST,
      loaded: posthog => {
        if (env.isDev) {
          posthog.debug();
        }
      },
      defaults: "2026-01-30",
      internal_or_test_user_hostname: "pg.stage.neuronhub.app|localhost",
    });
    return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
  }
  return <>{props.children}</>;
}
