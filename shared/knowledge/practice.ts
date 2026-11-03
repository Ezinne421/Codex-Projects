import { learningLessons } from "./learning.js";
export type LessonProgress = {
  correct: number;
  total: number;
  streak: number;
  lastReviewed: string;
  due: string;
  passed: boolean;
};
export type LearningProgress = Record<string, LessonProgress>;
export function localStudyDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validStudyDay(day: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day + "T12:00:00Z")) &&
    new Date(day + "T12:00:00Z").toISOString().slice(0, 10) === day
  );
}
function addDays(day: string, count: number) {
  return new Date(Date.parse(day + "T12:00:00Z") + count * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function readLearningProgress(raw: string | null): LearningProgress {
  try {
    const parsed: unknown = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const clean: LearningProgress = {};
    for (const lesson of learningLessons) {
      const p = (parsed as Record<string, LessonProgress>)[lesson.id];
      if (
        p &&
        Number.isInteger(p.correct) &&
        p.correct >= 0 &&
        p.total === lesson.questions.length &&
        p.correct <= p.total &&
        Number.isInteger(p.streak) &&
        p.streak >= 0 &&
        p.streak <= 5 &&
        typeof p.passed === "boolean" &&
        p.passed === (p.correct === p.total) &&
        validStudyDay(p.lastReviewed) &&
        validStudyDay(p.due) &&
        p.due >= p.lastReviewed
      )
        clean[lesson.id] = p;
    }
    return clean;
  } catch {
    return {};
  }
}
export function recordPractice(
  progress: LearningProgress,
  id: string,
  correct: number,
  total: number,
  today = localStudyDay(),
): LearningProgress {
  const lesson = learningLessons.find((l) => l.id === id);
  if (
    !lesson ||
    total !== lesson.questions.length ||
    !Number.isInteger(correct) ||
    correct < 0 ||
    correct > total ||
    !validStudyDay(today)
  )
    throw new Error("Invalid practice attempt.");
  const previous = progress[id],
    passed = correct === total;
  // Retakes can improve the score; they do not advance the review interval repeatedly in one day.
  const advances =
    previous?.lastReviewed !== today && (!previous || today >= previous.due);
  const streak = passed
    ? Math.min(5, Math.max(1, (previous?.streak || 0) + (advances ? 1 : 0)))
    : 0;
  const interval = [1, 1, 3, 7, 14, 30][streak];
  const due =
    passed && !advances && previous?.passed
      ? previous.due
      : addDays(today, interval);
  return {
    ...progress,
    [id]: { correct, total, passed, streak, lastReviewed: today, due },
  };
}
export function dueLessons(
  progress: LearningProgress,
  today = localStudyDay(),
) {
  return learningLessons
    .filter((l) => progress[l.id] && progress[l.id].due <= today)
    .sort((a, b) => progress[a.id].due.localeCompare(progress[b.id].due));
}
export type PracticeTool = "evm" | "pert" | "flow" | "oee";
export const practiceTools = [
  {
    id: "evm",
    title: "Earned value & forecast",
    fields: [
      ["pv", "Planned value (PV)", "100000"],
      ["ev", "Earned value (EV)", "80000"],
      ["ac", "Actual cost (AC)", "100000"],
      ["bac", "Budget at completion (BAC)", "200000"],
    ],
    assumption:
      "Use the same scope, currency and status date. CPI/SPI are efficiency ratios, not profit or calendar delay. EAC = BAC/CPI assumes current cost efficiency continues.",
  },
  {
    id: "pert",
    title: "Three-point PERT estimate",
    fields: [
      ["optimistic", "Optimistic duration (days)", "4"],
      ["likely", "Most likely duration (days)", "7"],
      ["pessimistic", "Pessimistic duration (days)", "16"],
    ],
    assumption:
      "The weighted mean is (O + 4M + P)/6. It is a modelling convention, not a guaranteed duration or a completion probability.",
  },
  {
    id: "flow",
    title: "Little’s Law",
    fields: [
      ["throughput", "Average throughput (items/day)", "5"],
      ["time", "Average time in system (days)", "4"],
    ],
    assumption:
      "Use a stable observation period and the same system boundary. Average WIP = throughput × average time. This does not predict an individual item’s completion time.",
  },
  {
    id: "oee",
    title: "Overall equipment effectiveness",
    fields: [
      ["availability", "Availability (%)", "90"],
      ["performance", "Performance (%)", "95"],
      ["quality", "Quality (%)", "98"],
    ],
    assumption:
      "Availability = run time/planned production time; performance = ideal cycle time × total count/run time; quality = good count/total count. This exercise assumes valid component percentages between 0 and 100.",
  },
] as const;
export function calculatePractice(
  tool: PracticeTool,
  inputs: Record<string, string>,
): { results: [string, number, string][]; error?: string } {
  const definition = practiceTools.find((t) => t.id === tool);
  if (!definition) return { results: [], error: "Choose a valid exercise." };
  const v: Record<string, number> = {};
  for (const [key] of definition.fields) {
    const raw = inputs[key];
    if (
      typeof raw !== "string" ||
      !raw.trim() ||
      !Number.isFinite(Number(raw)) ||
      Number(raw) < 0
    )
      return {
        results: [],
        error: "Enter a finite, non-negative number in every field.",
      };
    v[key] = Number(raw);
  }
  let results: [string, number, string][] = [];
  if (tool === "evm") {
    if (v.pv <= 0 || v.ac <= 0 || v.bac <= 0)
      return {
        results: [],
        error: "PV, AC and BAC must be greater than zero for these ratios.",
      };
    if (v.ev > v.bac || v.pv > v.bac)
      return {
        results: [],
        error:
          "Cumulative EV and PV cannot exceed BAC in this exercise. Check the baseline and units.",
      };
    results = [
      ["Cost performance index (CPI)", v.ev / v.ac, "ratio"],
      ["Schedule performance index (SPI)", v.ev / v.pv, "ratio"],
      ["Cost variance (CV)", v.ev - v.ac, "currency units"],
      ["Schedule variance (SV)", v.ev - v.pv, "budget-value units"],
    ];
    if (v.ev > 0) {
      const eac = v.bac / (v.ev / v.ac);
      results.push(
        ["Conditional estimate at completion (EAC)", eac, "currency units"],
        ["Variance at completion (VAC)", v.bac - eac, "currency units"],
      );
    }
  }
  if (tool === "pert") {
    if (v.optimistic > v.likely || v.likely > v.pessimistic)
      return {
        results: [],
        error: "Use optimistic ≤ most likely ≤ pessimistic duration.",
      };
    results = [
      [
        "Weighted mean duration",
        (v.optimistic + 4 * v.likely + v.pessimistic) / 6,
        "days",
      ],
    ];
  }
  if (tool === "flow")
    results = [["Average work in progress", v.throughput * v.time, "items"]];
  if (tool === "oee") {
    if (Object.values(v).some((n) => n > 100))
      return { results: [], error: "Enter each percentage between 0 and 100." };
    results = [
      [
        "Overall equipment effectiveness",
        (v.availability * v.performance * v.quality) / 10000,
        "%",
      ],
    ];
  }
  if (results.some(([, n]) => !Number.isFinite(n)))
    return {
      results: [],
      error:
        "The result is outside the supported numeric range. Use smaller, consistent values.",
    };
  return { results };
}
