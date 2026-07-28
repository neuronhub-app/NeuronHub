import type { BaseHit, Hit } from "instantsearch.js";
import { useHits } from "react-instantsearch";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { errors } from "@/utils/errors";
import { track } from "@/utils/track/track";
import { useInit } from "@/utils/useInit";

export function useTrackJobUrlClick(args: { slug: string; jobHit: Hit<BaseHit> }) {
  const hits = useHits();

  return (view: track.ViewOf<"JobCard">) => {
    track.event("Job.click_url_ext", { slug: args.slug, view });

    try {
      hits.sendEvent("click", args.jobHit, "Job.click_url_ext", { view });
    } catch (error) {
      errors.reportSilent(error);
    }
  };
}

export const AlertIdParamFromEmail = "alert";
export function useTrackAlertClickOnMount(args: { alert_id: ID | null; job_slug?: string }) {
  const state = useStateValtio({
    isClickSaved: false,
  });

  useInit({
    isReady: Boolean(args.alert_id && args.job_slug),
    onInit: async () => {
      if (!state.mutable.isClickSaved) {
        state.mutable.isClickSaved = true;

        if (args.alert_id && args.job_slug) {
          track.event("JobAlert.read", { alert_id: args.alert_id, job_slug: args.job_slug });

          await trackAlertClickByServer(args.alert_id, args.job_slug);
        }
      }
    },
  });
}

/**
 * @deprecated: With Posthog it became redundant.
 */
async function trackAlertClickByServer(alertId: ID, jobSlug: string) {
  try {
    const res = await client.mutate({
      mutation: JobAlertTrackClickMutation,
      variables: { id: alertId, jobSlug: jobSlug },
    });
    if (!res.data?.job_alert_track_click) {
      errors.reportSilent(new Error("JobAlert click track failed"));
    }
  } catch (error) {
    errors.reportSilent(error);
  }
}

const JobAlertTrackClickMutation = graphql.persisted(
  "JobAlertTrackClick",
  graphql(`
    mutation JobAlertTrackClick($id: ID!, $jobSlug: String!) {
      job_alert_track_click(id: $id, job_slug: $jobSlug)
    }
  `),
);
