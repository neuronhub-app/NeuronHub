import * as Sentry from "@sentry/react-router";
import { posthog } from "posthog-js";

import { AlertType } from "@/apps/jobs/subscriptions/JobAlertList";
import type { User } from "@/apps/users/UserStateProvider";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { errors } from "@/utils/errors";
import { useInit } from "@/utils/useInit";

/**
 * FYI: called in parallel with [[UserStateProvider]]: `posthog` can fails by being `undefined`,
 * its TS typing it BS.
 */
export async function setUser(opts: {
  user?: User;
  email?: string;
  idRandom?: boolean;
}): Promise<undefined> {
  try {
    const email = opts.user?.email ?? opts.email;

    const anonName = email ? await generateAnonNameFromEmail(email) : null;
    if (anonName) {
      // undocumented - might break outside of dev mode.
      if (!posthog._isIdentified()) {
        posthog.identify(anonName);
      }

      if (opts.user?.is_staff) {
        posthog.setInternalOrTestUser();
      }
    }

    Sentry.setUser({ id: anonName ?? getOrCreateAnonIdForSentry() });
  } catch (error) {
    errors.reportSilent(error);
  }
}

export function useSetUserByJobAlertId(args: {
  idExt?: string;
  alerts: ReadonlyArray<AlertType>;
}) {
  let email = args.idExt
    ? (args.alerts.find(alert => alert.id_ext === args.idExt)?.email ?? "")
    : args.alerts[0]?.email;

  useInit({
    isReady: Boolean(email),
    onInit: async () => {
      if (email) {
        await setUser({ email });
      }
    },
    // #AI: email dep because `args.alerts` ref churns on each HTTP refetch.
    dependencies: [email],
  });
}

async function generateAnonNameFromEmail(email: string): Promise<string | null> {
  try {
    const res = await client.mutate({ mutation: GenAnonNameMutation, variables: { email } });
    return res.data?.gen_anon_name_from_email ?? null;
  } catch (error) {
    errors.reportSilent(error);
    return null;
  }
}

const GenAnonNameMutation = graphql.persisted(
  "GenAnonName",
  graphql(`
    mutation GenAnonName($email: String!) {
      gen_anon_name_from_email(email: $email)
    }
  `),
);

/**
 * Our Sentry Org strips IPs => without an `id` (ie IP) Sentry counts error-affected users as "0".
 */
function getOrCreateAnonIdForSentry(): string {
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
