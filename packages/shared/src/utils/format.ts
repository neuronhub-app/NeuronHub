export namespace format {
  export function slugToTitle(slug: string): string {
    return slug
      .split("-")
      .map(word => capitalize(word))
      .join(" ");
  }

  export function capitalize<T extends string>(str: T): Capitalize<T> {
    return (str[0].toUpperCase() + str.slice(1)) as Capitalize<T>;
  }

  /**
   * @deprecated use chakra's <FormatNumber/>
   * #AI
   */
  export function money(value?: number | null, opts?: { roundDown10k: boolean }): string {
    if (value === null || value === undefined) {
      return "";
    }

    let thousands = Math.round(value / 1000);
    if (opts?.roundDown10k) {
      thousands = Math.floor(thousands / 10) * 10;
    }
    return `$${thousands}k`;
  }
}
