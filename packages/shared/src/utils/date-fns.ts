import { TZDate, tzName } from "@date-fns/tz";
import { format, formatDistanceToNowStrict, isFuture, isToday, isYesterday } from "date-fns";

// todo ? refac-name: datetime.ts
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

  export function relativeRounded(dateRaw: DateRaw): string {
    const date = parseRaw(dateRaw);
    if (!date) {
      return "";
    }
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return `${formatDistanceToNowStrict(date, { roundingMethod: "floor" })} ago`;
  }

  export function relative(dateRaw: DateRaw): string {
    const date = parseRaw(dateRaw);
    if (!date) {
      return "";
    }
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    const distanceVerbose = formatDistanceToNowStrict(date);
    const distance = distanceVerbose
      .replace(" seconds", "s")
      .replace(" minutes", "min")
      .replace(" hours", "h")
      .replace(" days", "d")
      .replace(" months", "m")
      .replace(" month", "m")
      .replace(" years", "y");

    if (isFuture(date)) {
      return `in ${distance}`;
    }
    return `${distance} ago`;
  }

  export function date(dateRaw: DateRaw): string {
    const date = parseRaw(dateRaw);
    if (!date) {
      return "";
    }
    return format(date, "MMM d, yyyy");
  }

  export function isFutureDate(dateRaw: DateRaw): boolean {
    const date = parseRaw(dateRaw);
    if (date) {
      return isFuture(date);
    }
    return false;
  }

  export function parseRaw(dateRaw: DateRaw): Date | undefined {
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
