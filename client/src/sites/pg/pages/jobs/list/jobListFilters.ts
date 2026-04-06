import { format } from "@neuronhub/shared/utils/format";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";
import type { ExtraTag } from "@/sites/pg/components/PgAlgoliaFacetsActive";

const state = proxy({
  salaryMin: null as number | null,
  excludeNoSalary: false,
});

export function useJobListFilters() {
  return { snap: useSnapshot(state), mutable: state };
}

export function resetJobListFilters() {
  state.salaryMin = null;
  state.excludeNoSalary = false;
}

export function useJobListAlgoliaFilters(): string {
  const snap = useSnapshot(state);

  const parts: string[] = [];
  if (snap.salaryMin != null && snap.salaryMin > 0) {
    if (snap.excludeNoSalary) {
      parts.push(`salary_min >= ${snap.salaryMin}`);
    } else {
      parts.push(`(salary_min >= ${snap.salaryMin} OR salary_min = 0)`);
    }
  } else if (snap.excludeNoSalary) {
    parts.push("salary_min > 0");
  }
  return parts.join(" AND ");
}

export function useJobListExtraTags(): ExtraTag[] {
  const snap = useSnapshot(state);

  const tags: ExtraTag[] = [];
  if (snap.salaryMin != null && snap.salaryMin > 0) {
    tags.push({
      label: `Minimum Salary: ${format.money(snap.salaryMin)}+`,
      onRemove: () => {
        state.salaryMin = null;
      },
    });
  }
  if (snap.excludeNoSalary) {
    tags.push({
      label: "Exclude No Salary Roles",
      onRemove: () => {
        state.excludeNoSalary = false;
      },
    });
  }
  return tags;
}
