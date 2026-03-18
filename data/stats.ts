export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

export const stats: Stat[] = [
  {
    id: "stat-experiences",
    label: "Experiences",
    value: 1000,
    suffix: "+",
  },
  {
    id: "stat-countries",
    label: "Countries",
    value: 50,
    suffix: "+",
  },
  {
    id: "stat-lives",
    label: "Lives Impacted",
    value: 3000,
    suffix: "+",
  },
  {
    id: "stat-years",
    label: "Years of Impact",
    value: 15,
    suffix: "+",
  },
];
