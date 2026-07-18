type Explainer = { menu: string; card?: string };

export const explainers = {
  highlighted: {
    menu: "Roles at organizations we think may be particularly impactful or promising.",
    card: "We think this organization may be particularly impactful or promising.",
  },
  careerCapital: {
    menu: "Roles that could help you build skills and credentials, but have limited scope for direct impact.",
    card: "This role could help you build skills and credentials, but has limited scope for direct impact.",
  },
  profitForGood: {
    menu: "Roles at organizations that donate, or plan to donate, a significant share of profits to impactful causes.",
    card: "This organization donates, or plans to donate, a significant share of profits to impactful causes.",
  },
  aiSafety: {
    menu: "For a job board focused on AI safety & policy, see jobs.80000hours.org",
  },
} as const satisfies Record<string, Explainer>;

export const explainerByTagName: Record<string, Explainer> = {
  "Career-Capital": explainers.careerCapital,
  "Profit for Good": explainers.profitForGood,
  "AI Safety & Policy": explainers.aiSafety,
};
