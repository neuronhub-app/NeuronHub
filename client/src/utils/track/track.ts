import { posthog } from "posthog-js";

import type { buildJobAlertVars } from "@/apps/jobs/list/JobsSubscribeModal";
import { errors } from "@/utils/errors";
import * as jobsModule from "@/utils/track/jobs";
import * as usersModule from "@/utils/track/users";

export namespace track {
  export const jobs = jobsModule;
  export const users = usersModule;

  export function event<Name extends EventName>(name: Name, props: EventProps<Name>) {
    try {
      posthog.capture(name, { model: EventSchema[name].model, ...props });
    } catch (error) {
      errors.reportSilent(error);
    }
  }

  // prettier-ignore
  const EventSchema = {
    "Job.read":                 { model: "Job",      props: {} as { view: View; slug: string } },
    "Job.click_url_ext":        { model: "Job",      props: {} as { view: View; slug: string } },
    "Job.create":               { model: "Job",      props: {} as { slug: string } },
    "Job.update":               { model: "Job",      props: {} as { slug: string } },
    "Job.delete":               { model: "Job",      props: {} as { slug: string } },
    "Job.click_org_url_ext":    { model: "Job",      props: {} as { slug: string; org_slug: string } },
    "JobAlert.read":            { model: "JobAlert", props: {} as { alert_id: string; job_slug: string } },
    "JobAlert.create":          { model: "JobAlert", props: {} as JobAlertVars },
    "ui.JobAlert.button.click": { model: "JobAlert", props: {} as JobAlertVars },
    "ui.Job.card.expand":       { model: "Job",      props: {} as { slug: string } },
    "ui.Job.card.close":        { model: "Job",      props: {} as { slug: string } },
    "ui.Job.filter.select":     { model: "Job",      props: {} as { view: View; name: string; values_current: string[], value_new: string } },
    "ui.Job.filter.reset":      { model: "Job",      props: {} as { view: View; name: string | undefined } },
    "ui.Job.sort.change":       { model: "Job",      props: {} as { view: View; value: string } },
  } as const;

  export type View =
    | "PostCard"
    | "ToolCard"
    | "ReviewCard"
    | "ProfileCard"
    | "JobCard"
    | "JobCard.title"
    | "JobCard.button"
    | "JobList";

  export type ViewOf<Prefix extends View> = Extract<View, `${Prefix}.${string}`>;

  type JobAlertVars = ReturnType<typeof buildJobAlertVars>;
  type Schema = typeof EventSchema;
  type EventName = keyof Schema;
  type EventProps<Name extends EventName> = {
    -readonly [Field in keyof Schema[Name]["props"]]: Schema[Name]["props"][Field];
  };
}
