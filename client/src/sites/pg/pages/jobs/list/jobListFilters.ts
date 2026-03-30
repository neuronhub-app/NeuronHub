import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";

const URL_KEYS = {
  salaryMin: "salaryMin",
  excludeNoSalary: "excludeNoSalary",
} as const;

const state = proxy({
  salaryMin: null as number | null,
  excludeNoSalary: false,
});

export function useJobListFilters() {
  return { snap: useSnapshot(state), mutable: state };
}

function readUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  if (state.salaryMin != null && state.salaryMin > 0) {
    params[URL_KEYS.salaryMin] = String(state.salaryMin);
  }
  if (state.excludeNoSalary) {
    params[URL_KEYS.excludeNoSalary] = "true";
  }
  return params;
}

function writeUrlParams(params: Record<string, string>) {
  const salary = params[URL_KEYS.salaryMin];
  state.salaryMin = salary != null ? Number(salary) || null : null;
  state.excludeNoSalary = params[URL_KEYS.excludeNoSalary] === "true";
}

export const jobListFiltersUrlParams = {
  keys: Object.values(URL_KEYS),
  read: readUrlParams,
  write: writeUrlParams,
};

export function resetJobListFilters() {
  state.salaryMin = null;
  state.excludeNoSalary = false;
}
