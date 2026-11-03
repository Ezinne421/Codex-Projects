export async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "ProjectManager",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let data: any;
  try {
    data = JSON.parse(await response.text());
  } catch {
    throw new Error(
      response.status === 429
        ? "Too many requests. Please wait a moment before trying again."
        : "The service is temporarily unavailable. Please try again shortly.",
    );
  }
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
export const today = () => new Date().toISOString().slice(0, 10);
export const money = (n: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n / 100);
export type Project = {
  id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  currency: string;
  start_date: string;
  end_date: string;
  status: string;
  contingency: number;
  tax: number;
  created_at: string;
  working_week: string;
  revision: number;
};
export type Bundle = {
  permissions: { canEdit: boolean; canManage: boolean; role: string };
  dependencies: any[];
  project: Project;
  tasks: any[];
  budget_items: any[];
  expenses: any[];
  risks: any[];
  updates: any[];
  documents: any[];
  finance: {
    subtotal: number;
    contingency: number;
    tax: number;
    total: number;
    spent: number;
    remaining: number;
    variance: number;
    utilisation: number | null;
  };
};
