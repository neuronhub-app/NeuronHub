export namespace format {
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
