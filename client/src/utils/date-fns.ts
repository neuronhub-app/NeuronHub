import { differenceInDays, format, formatDistanceToNowStrict, isSameYear } from "date-fns";

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
    return format(date, "MMMM d, yyyy h:mmaaaaa'm");
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

    let dateStr = `${formatDistanceToNowStrict(date)} ago`;

    const daysAgo = differenceInDays(new Date(), date);
    const isMoreThan30Days = 30 < daysAgo;

    if (isMoreThan30Days) {
      if (isSameYear(date, new Date())) {
        dateStr = format(date, "MMMM d, h:mmaaaaa'm");
      } else {
        dateStr = format(date, "MMMM d, yyyy h:mmaaaaa'm");
      }
    }
    return dateStr;
  }
}
