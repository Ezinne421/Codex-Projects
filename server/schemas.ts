import { z } from "zod";
const text = z.string().trim().min(1).max(200);
const long = z.string().trim().max(30000);
const date = z.iso.date();
export const currency = z.enum(["NGN", "USD", "GHS", "KES"]);
export const projectSchema = z
  .object({
    title: text,
    description: long.default(""),
    industry: text,
    location: z.string().trim().max(200).default(""),
    currency,
    start_date: date,
    end_date: date,
    status: z.enum(["Active", "On hold", "Completed"]).default("Active"),
    contingency: z.number().min(0).max(100).default(0),
    tax: z.number().min(0).max(100).default(0),
  })
  .refine((p) => p.end_date >= p.start_date, {
    message: "End date must follow start date",
  });
export const schemas = {
  tasks: z
    .object({
      title: text,
      owner: z.string().trim().max(200).default(""),
      start_date: date,
      end_date: date,
      status: z.enum(["To do", "In progress", "Done"]),
      progress: z.number().int().min(0).max(100),
    })
    .refine((t) => t.end_date >= t.start_date, {
      message: "End date must follow start date",
    })
    .refine((t) => (t.status === "Done") === (t.progress === 100), {
      message:
        "Done tasks must have 100% progress; unfinished tasks must be below 100%",
    }),
  budget_items: z
    .object({
      title: text,
      category: text,
      quantity: z.number().positive().max(1000000),
      rateMinor: z.number().int().min(0).max(1e10),
    })
    .refine((x) => Number.isSafeInteger(Math.round(x.quantity * x.rateMinor)), {
      message: "Line amount too large",
    }),
  expenses: z.object({
    title: text,
    amountMinor: z.number().int().positive().max(1e13),
    date,
    budget_item_id: z.string().uuid().nullable().default(null),
  }),
  risks: z.object({
    title: text,
    category: text,
    probability: z.number().int().min(1).max(5),
    impact: z.number().int().min(1).max(5),
    warning: long.default(""),
    mitigation: long.default(""),
    contingency: long.default(""),
    owner: z.string().trim().max(200).default(""),
    review_date: date,
    status: z.enum(["Open", "Mitigating", "Closed"]),
  }),
  updates: z.object({ content: long.min(1), date }),
  documents: z.object({
    title: text,
    type: z.enum([
      "Project plan",
      "Progress report",
      "Proposal",
      "Project charter",
      "Risk register",
      "Procurement plan",
      "Meeting minutes",
      "Closure report",
    ]),
    content: long.default(""),
  }),
};
export type Resource = keyof typeof schemas;
