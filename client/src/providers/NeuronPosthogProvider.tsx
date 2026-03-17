import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { env } from "@/env";
import { ReactNode } from "react";

export function NeuronPosthogProvider(props: { children: ReactNode }) {
  if (env.isProd) {
    posthog.init(env.VITE_POSTHOG_TOKEN, {
      api_host: env.VITE_POSTHOG_HOST,
      loaded: posthog => {
        // posthog.debug();
      },
    });
  }
  return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
}
