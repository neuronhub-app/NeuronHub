export namespace format {
  // #AI
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

  export function salary(min?: number | null, max?: number | null): string {
    if (!min) {
      return "Not specified";
    }
    const formatAmount = (amount: number) => `$${amount.toLocaleString("en-US")}`;
    return max ? `${formatAmount(min)} – ${formatAmount(max)}` : `${formatAmount(min)}+`;
  }
}
