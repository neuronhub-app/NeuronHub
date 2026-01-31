import { TZDate, tzName } from "@date-fns/tz";
import { format, formatDistanceToNowStrict } from "date-fns";

export namespace datetime {
  type DateRaw = Date | number | string | unknown;

  export function full(dateRaw: DateRaw): string {
    const date = parseRaw(dateRaw);
    if (!date) {
      return "";
    }
    const tz = new TZDate(date).timeZone;
    const tzNameShort = tz ? tzName(tz, date, "shortGeneric") : "";

    return `${format(date, "yyyy-MM-dd kk:mm")} ${tzNameShort}`;
  }

  export function relative(dateRaw: DateRaw): string {
    const date = parseRaw(dateRaw);
    if (!date) {
      return "";
    }
    const distanceVerbose = formatDistanceToNowStrict(date);
    const distance = distanceVerbose
      .replace(" seconds", "s")
      .replace(" minutes", "min")
      .replace(" hours", "h")
      .replace(" days", "d")
      .replace(" months", "m")
      .replace(" years", "y");

    return `${distance} ago`;
  }

  function parseRaw(dateRaw: DateRaw): Date | undefined {
    if (!dateRaw) {
      return;
    }

    if (isDateValid(dateRaw)) {
      return dateRaw;
    }

    const date = new Date(String(dateRaw));
    if (isDateValid(date)) {
      return date;
    }
  }

  function isDateValid(date: Date | unknown): date is Date {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }
}
