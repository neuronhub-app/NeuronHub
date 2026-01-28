import { TZDate, tzName } from "@date-fns/tz";
import { format, formatDistanceToNowStrict } from "date-fns";

export namespace datetime {
  export function full(dateRaw: Date | string | unknown) {
    if (!dateRaw) {
      return "";
    }
    const date = new Date(String(dateRaw));

    // #AI, related to #77
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const tz = new TZDate(date).timeZone;
    const tzNameShort = tz ? tzName(tz, date, "shortGeneric") : "";

    return `${format(date, "yyyy-MM-dd kk:mm")} ${tzNameShort}`.trim();
  }

  export function relative(dateRaw: Date | string | unknown) {
    if (!dateRaw) {
      return "";
    }
    const date = new Date(String(dateRaw));

    // #AI, related to #77
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return `${formatDistanceToNowStrict(date)} ago`;
  }
}
