import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { captureException } from "@sentry/react";
import type { BaseHit, Hit } from "instantsearch.js";
import { posthog } from "posthog-js";
import { useHits } from "react-instantsearch";

import type { buildJobAlertVars } from "@/apps/jobs/list/JobsSubscribeModal";
import type { User } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { errors } from "@/utils/errors";
import { useInit } from "@/utils/useInit";

// biome-ignore format: ...
const EventSchema = {
  "Job.create":             { group: "event", model: "Job" },
  "Job.read":               { group: "event", model: "Job",      extras: { view: "" as View } },
  "Job.update":             { group: "event", model: "Job" },
  "Job.delete":             { group: "event", model: "Job" },
  "Job.click_url_ext":      { group: "event", model: "Job",      extras: { view: "" as View } },
  "Job.click_org_url_ext":  { group: "event", model: "Job",      extras: { org_slug: "" as string } },
  "JobAlert.create":        { group: "event", model: "JobAlert", extras: {} as JobAlertVars },
  "JobAlert.read":          { group: "event", model: "JobAlert", extras: { job_id: "" as string } },
  "Job.card.expand":        { group: "ui",    model: "Job" },
  "Job.card.close":         { group: "ui",    model: "Job" },
  "Job.filter.select":      { group: "ui",    model: "Job",      extras: { view: "" as View, name: "" as string, value: "" as string } },
  "Job.filter.reset":       { group: "ui",    model: "Job",      extras: { view: "" as View, name: undefined as string | undefined } },
  "Job.sort.change":        { group: "ui",    model: "Job",      extras: { view: "" as View, value: "" as string } },
  "JobAlert.button.click":  { group: "ui",    model: "JobAlert", extras: {} as JobAlertVars },
} as const;

type View =
  | "PostCard"
  | "ToolCard"
  | "ReviewCard"
  | "JobCard"
  | "JobCard.title"
  | "JobCard.button"
  | "ProfileCard"
  | "job_list";

type ViewOf<Prefix extends View> = Extract<View, `${Prefix}.${string}`>;

type JobAlertVars = ReturnType<typeof buildJobAlertVars>;

export namespace track {
  export function event<Name extends EventKey>(
    name: Name,
    id: string,
    ...args: EventArgs<Name>
  ): void;
  export function event(name: EventKey, id: string, extras?: Record<string, unknown>): void {
    try {
      posthog.capture(name, { model: EventSchema[name].model, id, ...extras });
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
    }
  }

  export function ui<Name extends UiKey>(name: Name, ...args: UiArgs<Name>): void;
  export function ui(name: UiKey, idOrExtras: string | Record<string, unknown>): void {
    try {
      const payload =
        typeof idOrExtras === "string"
          ? { model: EventSchema[name].model, id: idOrExtras }
          : { model: EventSchema[name].model, ...idOrExtras };
      posthog.capture(`ui.${name}`, payload);
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
    }
  }

  export function setUser(opts: { user?: User; email?: string }) {
    const email = opts.email ?? opts.user?.email;

    if (opts.user?.is_staff) {
      posthog.setInternalOrTestUser();
    }
    if (email) {
      posthog.setPersonProperties({ email });
    }
  }

  export function useJobUrlClick(args: { slug: string; jobHit: Hit<BaseHit> }) {
    const hits = useHits();

    return (view: ViewOf<"JobCard">) => {
      track.event("Job.click_url_ext", args.slug, { view });

      try {
        hits.sendEvent("click", args.jobHit, "Job.click_url_ext", { view });
      } catch (err) {
        captureException(err);
      }
    };
  }

  export function useTrackJobView(args: { slug?: string; alertId: string | null }) {
    const state = useStateValtio({
      isViewSaved: false,
    });

    useInit({
      isReady: Boolean(args.alertId && args.slug),
      onInit: async () => {
        if (!state.mutable.isViewSaved) {
          state.mutable.isViewSaved = true;
          await trackAlertClick(args.alertId!, args.slug!);
        }
      },
    });
  }

  async function trackAlertClick(alertId: ID, jobSlug: string) {
    try {
      const res = await client.mutate({
        mutation: JobAlertTrackClickMutation,
        variables: { id: alertId, jobSlug: jobSlug },
      });
      if (!res.data?.job_alert_track_click) {
        captureException(new Error("JobAlert click track failed"));
      }
    } catch (error) {
      captureException(error);
    }
  }
}
const JobAlertTrackClickMutation = graphql.persisted(
  "JobAlertTrackClick",
  graphql(`mutation JobAlertTrackClick($id: ID!, $jobSlug: String!) {
      job_alert_track_click(id: $id, job_slug: $jobSlug)
    }`),
);

type Schema = typeof EventSchema;

type KeysByGroup<Group extends string> = {
  [Key in keyof Schema]: Schema[Key]["group"] extends Group ? Key : never;
}[keyof Schema];

type ExtrasOf<Key extends keyof Schema> = Schema[Key] extends { extras: infer Extras }
  ? { -readonly [Field in keyof Extras]: Extras[Field] }
  : never;

type EventKey = KeysByGroup<"event">;
type UiKey = KeysByGroup<"ui">;

type EventArgs<Name extends EventKey> =
  ExtrasOf<Name> extends never ? [] : [extras: ExtrasOf<Name>];

type UiArgs<Name extends UiKey> =
  ExtrasOf<Name> extends never ? [id: string] : [extras: ExtrasOf<Name>];
