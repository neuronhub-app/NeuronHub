import { errors } from "@/utils/errors";

export namespace utm {
  /**
   * UTM params are saved until a new UTM URL is used.
   */
  export function saveToLocalStorageFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);

    const utmParams: Record<string, string> = {};
    for (const utmKey of utmKeys) {
      const utmValue = searchParams.get(utmKey);
      if (utmValue) {
        utmParams[utmKey] = utmValue;
      }
    }

    if (Object.keys(utmParams).length === 0) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(utmParams));
    } catch (error) {
      errors.reportSilent(error);
    }
  }

  const storageKey = "job_alert_utm_params";
  // todo ! fix: duplicate of jobs/graphql.py.
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

  export function getStored(): Record<string, string> {
    const utmParamsJson = readLocalStorageRaw();

    const utmParams: Record<string, string> = {};
    for (const utmKey of utmKeys) {
      const utmValue = utmParamsJson[utmKey];
      // #bad-infer if-hack
      if (typeof utmValue === "string") {
        utmParams[utmKey] = utmValue;
      }
    }
    return utmParams;
  }

  function readLocalStorageRaw(): Record<string, unknown> {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    } catch (error) {
      errors.reportSilent(error);
      return {};
    }
  }
}
