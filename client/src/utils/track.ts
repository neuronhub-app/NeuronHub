import * as Sentry from "@sentry/react-router";
import type { BaseHit, Hit } from "instantsearch.js";
import { posthog } from "posthog-js";
import { useHits } from "react-instantsearch";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import type { buildJobAlertVars } from "@/apps/jobs/list/JobsSubscribeModal";
import type { User } from "@/apps/users/useUserCurrent";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import { errors } from "@/utils/errors";
import { useInit } from "@/utils/useInit";

// prettier-ignore
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

  /**
   * #AI: cached to stop a dozen on mount triggers; deduped by identity key so PostHog/Sentry/GenAnonName are hit once.
   * Failed promises are cached too — transient errors won't retry until the identity key changes.
   */
  export function setUser(opts?: { user?: User; email?: string }): Promise<string> {
    const key = opts?.user?.id ?? opts?.email ?? "__anon__";
    if (userCache.key === key && userCache.promise) {
      return userCache.promise;
    }
    userCache.key = key;
    userCache.promise = _setUser(opts);
    return userCache.promise;
  }

  /**
   * #AI
   */
  async function _setUser(opts?: { user?: User; email?: string }): Promise<string> {
    try {
      if (opts?.user) {
        Sentry.setUser(opts.user);

        // posthog
        if (opts.user.is_staff) {
          posthog.setInternalOrTestUser();
        }
        const anonName = await getAnonName(opts.user.email);
        if (anonName) {
          posthog.identify(anonName);
        }
        return anonName;
      }

      if (opts?.email) {
        const anonName = await getAnonName(opts.email);
        if (anonName) {
          posthog.identify(anonName);
          Sentry.setUser({ id: anonName });
        }
        return anonName;
      }

      const anonId = getOrCreateAnonId();
      Sentry.setUser({ id: anonId });

      return anonId;
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
      return "";
    }
  }

  export function useSetUserByJobAlertId(args: {
    idExt?: string;
    alerts?: ReadonlyArray<{ id_ext: string; email: string }>;
  }) {
    // #AI: `email` dep avoids refires on `args.alerts` ref churn from useApolloQuery refetches.
    // Module cache in `setUser` handles any residual refire (eg navigation remount).
    const email = args.alerts?.find(alert => alert.id_ext === args.idExt)?.email;
    useInit({
      isReady: Boolean(email),
      onInit: async () => {
        await setUser({ email: email! });
      },
      dependencies: [email],
    });
  }

  export async function getAnonName(email: string): Promise<string> {
    try {
      const res = await client.mutate({ mutation: GenAnonNameMutation, variables: { email } });
      return res.data?.gen_anon_name_from_email ?? "";
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
      return "";
    }
  }

  export function useJobUrlClick(args: { slug: string; jobHit: Hit<BaseHit> }) {
    const hits = useHits();

    return (view: ViewOf<"JobCard">) => {
      track.event("Job.click_url_ext", args.slug, { view });

      try {
        hits.sendEvent("click", args.jobHit, "Job.click_url_ext", { view });
      } catch (error) {
        errors.report(error, { isShowFeedbackPopup: false });
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
        errors.report(new Error("JobAlert click track failed"), { isShowFeedbackPopup: false });
      }
    } catch (error) {
      errors.report(error, { isShowFeedbackPopup: false });
    }
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

const GenAnonNameMutation = graphql.persisted(
  "GenAnonName",
  graphql(`
    mutation GenAnonName($email: String!) {
      gen_anon_name_from_email(email: $email)
    }
  `),
);

const userCache: { key: string | null; promise: Promise<string> | null } = {
  key: null,
  promise: null,
};

// Sentry org settings strip IPs => without an `id` it counts error-affected users as "0".
function getOrCreateAnonId(): string {
  const storageKey = "nha-sentry-anon-id";
  try {
    const idExisting = localStorage.getItem(storageKey);
    if (idExisting) {
      return idExisting;
    }
    const idNew = crypto.randomUUID();
    localStorage.setItem(storageKey, idNew);
    return idNew;
  } catch {
    return crypto.randomUUID();
  }
}

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
