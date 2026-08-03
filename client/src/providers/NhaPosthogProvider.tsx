/**
 * todo ? refac: don't have a folder with a single Comp. Move it up, or place more Providers in this dir.
 */
import { PostHogProvider } from "@posthog/react";
import posthog, { CaptureResult } from "posthog-js";
import { ReactNode } from "react";

import { env } from "@/env";

export function NhaPosthogProvider(props: { children: ReactNode }) {
  if (env.mode.isClient && env.VITE_POSTHOG_IS_ENABLED) {
    posthog.init(env.VITE_POSTHOG_TOKEN, {
      api_host: env.VITE_POSTHOG_HOST,
      ui_host: env.VITE_POSTHOG_HOST_UI, // needed if reverse-proxy is used.
      loaded: posthog => {
        if (env.isDev) {
          posthog.debug();
        }
      },
      defaults: "2026-01-30",
      internal_or_test_user_hostname: "pg.stage.neuronhub.app|localhost",
      before_send: function (event) {
        for (const propPrivate of [
          "$ip",
          "$raw_user_agent",
          "$geoip_latitude",
          "$geoip_longitude",
          "$geoip_accuracy_radius",
          "$geoip_postal_code",
        ]) {
          if (event?.properties[propPrivate]) {
            event.properties[propPrivate] = null;
          }
        }
        return event;
      },
    });
    return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
  }
  return <>{props.children}</>;
}
