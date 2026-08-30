import type { Metric } from "./types";

export const metrics: Metric[] = [
  {
    id: "dpo-registrations-2020-2021",
    value: "631 → 1,498",
    label: "New DPO registrations",
    context:
      "New Data Protection Officer registrations rose from 631 in 2020 to 1,498 in 2021 at the National Privacy Commission.",
  },
  {
    id: "compliance-checks-2021",
    value: "350 → 685",
    label: "Compliance checks, 2021",
    context:
      "2021 compliance-check completions rose from a target of 350 personal information controllers to 685 PICs.",
  },
  {
    id: "registered-entities-2024",
    value: "10,000+",
    label: "Registered entities",
    context:
      "More than 10,000 data-processing systems and DPO registered entities were on the national registration system by 30 September 2024.",
  },
];
